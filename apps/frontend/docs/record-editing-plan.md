# Record Editing and PostgreSQL Update Path — Implementation Plan

Hand-off plan for adding persistent record editing to the billing demo. The
application already reads records and denial-code definitions through:

```text
Browser -> Next route handlers -> Nest -> node-postgres -> PostgreSQL
```

This phase adds the reverse/write direction while preserving the working read
path.

## Goal

Allow the detail panel to update the editable fields of a billing record and
immediately reflect the committed PostgreSQL row in both the detail panel and
records grid.

```text
DetailPanel
  -> frontend updateRecord()
  -> Next PATCH /api/records/:id
  -> Nest PATCH /api/records/:id
  -> RecordsService.update()
  -> parameterized PostgreSQL UPDATE
  -> updated BillingRecord
  -> replace matching row in BillingPage state
```

## Current state

- PostgreSQL is the only production source for records and definitions.
- `GET /api/records` returns 20 records.
- `GET /api/definitions/:term` returns a definition or `404`.
- Next route handlers proxy both read APIs.
- `BillingPage` owns fetched `records` and `selectedId` state.
- `DetailPanel` renders uncontrolled inputs with `defaultValue`.
- The table is read-only; row selection drives the detail panel.
- The deny-code info button and table codes open the shared definition modal.
- `SelectedUserContext` stores the active demo user in the browser.
- There is no authentication. Selected-user identity is demonstrative only.
- `billing_records.who_changed` and `date_changed` currently contain empty
  strings in seeded rows.

## Editable and locked fields

### Editable through this endpoint

| Field | Type | Commit behavior |
|---|---|---|
| `comment` | string, maximum 255 characters | on blur |
| `denyCode` | string or `null` | dropdown selection; see open decision |
| `done` | boolean | immediately on change |

### Never accepted from the client as record changes

- `id`
- `patientNumber`
- `dos`
- `payer`
- `whoChanged`
- `dateChanged`

The server owns the record ID and audit fields. Claim-identity fields remain
locked according to the billing-page design.

## Proposed PATCH contract

```text
PATCH /api/records/:id
Content-Type: application/json
```

Proposed request body:

```ts
type UpdateRecordRequest = {
  comment?: string;
  denyCode?: string | null;
  done?: boolean;
  actorUserId: string;
};
```

Example:

```json
{
  "comment": "Corrected claim submitted.",
  "actorUserId": "u2"
}
```

Clearing a denial code is explicit:

```json
{
  "denyCode": null,
  "actorUserId": "u2"
}
```

Successful response:

```text
200 OK
```

with the complete updated `BillingRecord`, using the existing camelCase API
shape.

### Why the response contains the complete record

- PostgreSQL is the source of truth.
- The server-generated audit values return immediately.
- The frontend can replace one row without refetching the entire collection.
- Detail and grid views stay synchronized from one returned object.

## Audit identity caveat

There is no authentication, so Nest cannot independently know who is editing.
The browser must send the selected demo user's stable ID as `actorUserId`.
Nest uses that value to stamp `who_changed` and generates `date_changed`
server-side.

This is suitable for a local learning demo but is not a security boundary. With
real authentication, Nest would derive the actor from the authenticated session
or access token and would ignore any client-provided user ID.

## Open decisions to settle before implementation

### 1. What `whoChanged` stores

Recommended: store the stable demo user ID (for example, `u2`), not a display
name. The frontend can resolve the ID through its users list when a friendly
name is needed.

Alternative reduced-scope choice: store the existing display identifier. This
is faster but less relational and less stable.

### 2. When deny-code selection commits

Recommended: commit a dropdown selection immediately on `change`. A select has
an explicit choice event, and waiting for blur provides little benefit.

Alternative: preserve the original design decision and commit on blur.

### 3. Save behavior

Recommended: pessimistic updates for this phase. Show a saving state, wait for
the server, then replace the row. Do not optimistically change the grid before
the request succeeds.

### 4. Concurrent edits

Recommended: last successful write wins. Do not add versions, ETags, or
optimistic-concurrency checks in this demo phase.

## Phase 1 — List available denial codes

A dropdown should not duplicate the valid code list in frontend source. Add:

```text
GET /api/definitions
```

### Nest

- Add `DefinitionsService.findAll()`.
- Query `deny_code_definitions`, ordered by `term`.
- Add `@Get()` to `DefinitionsController` alongside `@Get(':term')`.
- Return `TermDefinition[]`.

Suggested SQL:

```sql
SELECT term, definition
FROM deny_code_definitions
ORDER BY term;
```

### Next

Add or extend the route handler for:

```text
apps/frontend/src/app/api/definitions/route.ts
```

### Frontend

Add `fetchDefinitions(): Promise<TermDefinition[]>`. The detail panel uses the
returned terms for its dropdown. The modal continues to fetch one full
definition by term.

**Checkpoint:** the browser can retrieve all 13 available definitions without
hardcoded code options.

## Phase 2 — Nest validation DTO

Create an `UpdateRecordDto` for the PATCH body. Use Nest validation with a
global validation pipe.

Validation requirements:

- Reject unknown properties (`whitelist` plus `forbidNonWhitelisted`).
- `comment`, when present, is a string no longer than 255 characters.
- `denyCode`, when present, is a string or `null`.
- `done`, when present, is a boolean.
- `actorUserId` is a required, non-empty string.
- At least one of `comment`, `denyCode`, or `done` must be present.
- Empty PATCH bodies are rejected with `400 Bad Request`.

Install only the standard Nest validation dependencies required by the
installed Nest version. Consult the installed/official Nest documentation at
implementation time.

### Important presence checks

Do not use truthiness to decide whether a field was supplied:

```ts
if (dto.done) // wrong: loses false
if (dto.denyCode) // wrong: loses null
```

Use an own-property/presence check so the API distinguishes:

```text
omitted denyCode -> leave unchanged
denyCode: null   -> clear the column

omitted done -> leave unchanged
done: false  -> store false
```

**Checkpoint:** invalid bodies fail before reaching `RecordsService`.

## Phase 3 — PostgreSQL update service

Add a service operation shaped conceptually as:

```ts
update(
  id: string,
  changes: EditableRecordChanges,
  actorUserId: string,
): Promise<BillingRecord | null>
```

### Query construction

Because this is PATCH, only supplied fields should change. Build the `SET` list
from a hardcoded mapping of allowed DTO fields to database columns. Values are
always parameters.

Conceptual example:

```text
comment supplied  -> comment = $1
done supplied     -> done = $2
always             who_changed = $3
always             date_changed = $4
WHERE id = $5
```

Column names must come only from server-owned code. Never use request keys as
raw SQL identifiers.

The final query uses `RETURNING` with the same camelCase aliases as `findAll()`:

```sql
UPDATE billing_records
SET ...
WHERE id = $n
RETURNING
  id,
  patient_number AS "patientNumber",
  dos,
  payer,
  comment,
  deny_code AS "denyCode",
  done,
  who_changed AS "whoChanged",
  date_changed AS "dateChanged";
```

### Audit stamping

- `who_changed`: the validated `actorUserId` supplied separately from changes.
- `date_changed`: generated by Nest with `new Date().toISOString()`.
- The client cannot override either value.

### Denial-code validation

When `denyCode` is a string, confirm it exists before updating. Recommended
reduced-scope behavior:

1. Query `deny_code_definitions` for the requested term.
2. Return `400 Bad Request` for an unknown code.
3. Retain the database foreign key as final integrity protection.

Because the definition table is static during this demo, a transaction is not
required for the existence check plus update. If definition deletion is added
later, revisit this decision.

### Not-found behavior

`UPDATE ... RETURNING` produces zero rows when the record ID is unknown. The
service returns `null`; the controller converts it to `404 Not Found`.

**Checkpoint:** direct service tests verify parameterization, omitted fields,
`false`, `null`, audit stamps, and zero-row behavior.

## Phase 4 — Nest PATCH controller

Add to `RecordsController`:

```text
PATCH /api/records/:id
```

Controller responsibilities:

1. Read `id` from `@Param('id')`.
2. Receive and validate `UpdateRecordDto` from `@Body()`.
3. Separate `actorUserId` from editable changes.
4. Call `RecordsService.update()`.
5. Convert a null result to `NotFoundException`.
6. Return the complete updated record.

Suggested error statuses:

| Condition | Status |
|---|---:|
| Valid update | 200 |
| Invalid body or denial code | 400 |
| Unknown record ID | 404 |
| Database unavailable | 500 initially; improve mapping later if desired |

**Checkpoint:** curl can update each editable field and retrieve the persisted
result through `GET /api/records`.

## Phase 5 — Next PATCH proxy

Create:

```text
apps/frontend/src/app/api/records/[id]/route.ts
```

The route handler should:

1. Await the Next 16 dynamic `id` parameter.
2. Parse the incoming JSON body.
3. Forward it to Nest with method `PATCH` and JSON content type.
4. Preserve useful upstream statuses (`400`, `404`).
5. Map an unreachable Nest service to `503`.
6. Return the updated record JSON on success.

Do not expose `BACKEND_URL` to the browser; it remains server-only.

**Checkpoint:** PATCH works through port 3000, not just directly against Nest on
port 3001.

## Phase 6 — Frontend API functions

Add:

```ts
updateRecord(
  id: string,
  request: UpdateRecordRequest,
  signal?: AbortSignal,
): Promise<DemoRecord>
```

Responsibilities:

- Encode the record ID in the URL.
- Send JSON with `PATCH`.
- Throw a useful error for non-success responses.
- Validate the returned value has the required record shape, or centralize a
  reusable runtime record guard shared with `getRecords()`.

Also add `fetchDefinitions()` for dropdown options.

**Checkpoint:** API-client unit tests cover success, validation errors, missing
records, unavailable service, response shape, and URL encoding.

## Phase 7 — BillingPage state update path

`BillingPage` already owns the authoritative browser copy of `records`. Add a
callback:

```ts
function handleRecordUpdated(updatedRecord: DemoRecord) {
  setRecords((currentRecords) =>
    currentRecords.map((record) =>
      record.id === updatedRecord.id ? updatedRecord : record,
    ),
  );
}
```

Pass the callback, active user ID, and denial-code options to `DetailPanel`.
Because `selected` is derived from `records`, replacing the array row updates
both the detail panel and grid automatically.

Do not refetch every record after a successful single-row update unless a later
requirement makes that necessary.

## Phase 8 — Convert DetailPanel to controlled editing

The current inputs use `defaultValue`, which does not reliably reset when a
different selected record is rendered in the same component instance. Convert
the editable fields to controlled values or remount the panel by record ID.

Recommended reduced-complexity structure:

- Render `<DetailPanel key={selected.id} ... />` so local draft state initializes
  cleanly for each selected record.
- Keep local state for `comment`, `denyCode`, and `done`.
- Use a `<select>` for `denyCode`, including an empty option mapped to `null`.
- Keep the info button opening the current selected denial code.
- Track `savingField` and `saveError`.
- Disable or guard repeated commits while one request is active.
- Skip the request when the draft equals the last committed value.

### Commit behavior

Comment:

```text
onBlur -> unchanged? stop : PATCH comment
```

Done:

```text
onChange -> PATCH done immediately
```

Deny code:

```text
recommended onChange -> PATCH denyCode immediately
```

### Success

1. Receive the complete updated record.
2. Call `onRecordUpdated(updatedRecord)`.
3. Clear the field's saving/error state.
4. Treat the returned server value as the new committed baseline.

### Failure

Recommended behavior:

- Show an inline error near the editable group.
- Keep or restore the last committed value consistently.
- Do not update the grid with an uncommitted draft.
- Allow the user to retry.

## Phase 9 — Tests

### Nest service tests

- Updates comment only.
- Updates done to both `true` and `false`.
- Sets denial code to a valid string.
- Clears denial code with `null`.
- Leaves omitted fields unchanged.
- Uses parameterized values.
- Does not allow request-controlled column names.
- Stamps actor and date.
- Returns the `RETURNING` row.
- Returns null when no record matches.
- Rejects an unknown denial code.

Mock `DatabaseService`; normal unit tests must not require PostgreSQL.

### Nest controller tests

- Delegates a valid DTO.
- Returns the updated record.
- Converts missing record to `404`.
- Validation rejects bad input in an e2e or validation-focused test.

### Next route-handler/API-client tests

- Forwards PATCH method, body, and JSON header.
- Preserves `400` and `404` responses.
- Maps unavailable Nest to `503`.
- Rejects invalid response shape.

### React component tests

- Comment commits on blur.
- Unchanged comment does not issue a request.
- Done commits immediately, including `false`.
- Dropdown options come from the definitions API.
- Empty dropdown value sends `denyCode: null`.
- Successful response updates detail and grid.
- Failed response shows an error without changing the grid.
- Audit fields display the returned server values.
- Definition info button opens the current dropdown/committed code as decided.

### Manual database verification

After editing a record through the UI, verify persistence directly:

```sql
SELECT
  id,
  comment,
  deny_code,
  done,
  who_changed,
  date_changed
FROM billing_records
WHERE id = 'r1';
```

Refresh the browser and confirm the edited value survives.

## Suggested implementation order

1. Settle the three open decisions.
2. Add definition-list endpoint and dropdown data client.
3. Add Nest validation dependencies and global pipe.
4. Create update DTO.
5. Implement/test `RecordsService.update()`.
6. Implement/test Nest PATCH controller.
7. Verify direct Nest PATCH with curl.
8. Create/test Next PATCH proxy.
9. Create/test frontend `updateRecord()`.
10. Add `BillingPage` replacement callback.
11. Convert `DetailPanel` to controlled editing.
12. Run full backend/frontend suites and manual persistence checks.
13. Update the main build plan status and backend README.

## Acceptance checklist

- [ ] Valid codes are loaded from PostgreSQL for the dropdown.
- [ ] Comment updates persist after refresh.
- [ ] Done updates persist after refresh, including `false`.
- [ ] Denial code can be changed to another valid code.
- [ ] Denial code can be cleared to `null`.
- [ ] Unknown denial code is rejected.
- [ ] Unknown record ID returns `404`.
- [ ] Empty/invalid PATCH bodies return `400`.
- [ ] Locked fields cannot be changed through PATCH.
- [ ] Nest stamps actor and date; the client cannot override them.
- [ ] SQL values are parameterized.
- [ ] Successful response updates both detail and grid without a full refetch.
- [ ] Failed updates do not appear committed in the grid.
- [ ] Refresh reads the persisted PostgreSQL value.
- [ ] Unit tests do not require a live database.
- [ ] Backend and frontend test suites pass.

## Deferred production concerns

- Real authentication-derived actor identity.
- Authorization rules for which users may edit which records.
- Optimistic concurrency/version checks.
- Database transactions for multi-table writes.
- Rate limiting and request tracing.
- Converting text dates to PostgreSQL `date` and `timestamptz` columns.
- Centralized structured error responses.
- Production migrations, backups, and deployment.

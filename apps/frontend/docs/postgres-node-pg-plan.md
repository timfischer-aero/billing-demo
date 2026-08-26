# PostgreSQL Persistence with node-postgres — Implementation Plan

Hand-off plan for replacing the Nest backend's in-memory record and denial-code
data with PostgreSQL. This phase intentionally uses the PostgreSQL driver
directly (`pg`, also called node-postgres) instead of Prisma or another ORM.

## Goal

Move the existing read paths to PostgreSQL without changing their public API
contracts or the working frontend behavior.

```text
Browser
  -> Next route handlers
  -> Nest controllers
  -> Nest services
  -> DatabaseService
  -> node-postgres Pool
  -> PostgreSQL
```

The following endpoints must keep working:

```text
GET /api/records
GET /api/definitions/:term
```

## Decisions (locked)

- **Database:** PostgreSQL.
- **Driver:** `pg` (node-postgres), using one application-wide connection pool.
- **No ORM:** no Prisma, TypeORM, Sequelize, or query builder.
- **No GraphQL in this phase:** the existing REST API remains the public API.
- **Configuration:** the backend reads a server-only `DATABASE_URL` environment
  variable. Credentials are never committed.
- **Schema and seed:** plain, reviewable SQL files.
- **SQL safety:** every query containing external values uses PostgreSQL
  parameters (`$1`, `$2`, etc.); never build SQL by concatenating user input.
- **Nest boundary:** feature services depend on an injected `DatabaseService`,
  not directly on `pg`. This keeps pooling/configuration centralized and makes
  services easy to unit test with a mock.
- **API shape remains camelCase:** SQL aliases map snake_case database columns
  to the existing TypeScript/API field names.
- **Current date contracts remain strings:** `dos` and `dateChanged` stay text
  in this reduced-scope phase so the frontend contract does not change. Moving
  them to PostgreSQL `date`/`timestamptz` types is deferred.
- **Read-only phase:** `PATCH /api/records/:id` and edit persistence are a later
  phase.
- **Provisioning is flexible:** local PostgreSQL or Docker is acceptable. Both
  use the same `DATABASE_URL`, so application code does not depend on the choice.

## Non-goals

- Production deployment or cloud database provisioning.
- Automated migration tooling or migration history management.
- Authentication/authorization.
- GraphQL.
- Record editing, transactions, or audit-field stamping.
- Runtime schema-validation library adoption.
- Moving frontend/backend types into a shared workspace package.

## Current state

The complete read path is already operational:

- Nest exposes records through `RecordsController` and `RecordsService`.
- Nest exposes definitions through `DefinitionsController` and
  `DefinitionsService`.
- Next proxies both APIs through same-origin route handlers.
- The billing page fetches records asynchronously.
- The definition modal fetches definitions asynchronously.
- Loading, missing-definition, and service-error behavior exist.
- Backend services currently read from:
  - `src/records/records.data.ts`
  - `src/definitions/definitions.data.ts`

Only the implementation behind the Nest services changes in this phase.

## Proposed filesystem layout

```text
apps/backend/
  database/
    schema.sql
    seed.sql
  src/
    database/
      database.module.ts
      database.service.ts
      database.service.spec.ts
    records/
      records.controller.ts
      records.service.ts
      record.type.ts
    definitions/
      definitions.controller.ts
      definitions.service.ts
      term-definition.type.ts
```

The two `*.data.ts` files remain until PostgreSQL-backed reads pass. They are
deleted only at the final cutover.

## Database schema

### `deny_code_definitions`

| Column | PostgreSQL type | Constraints | API field |
|---|---|---|---|
| `term` | `text` | primary key | `term` |
| `definition` | `text` | not null | `definition` |

### `billing_records`

| Column | PostgreSQL type | Constraints | API field |
|---|---|---|---|
| `id` | `text` | primary key | `id` |
| `patient_number` | `text` | not null | `patientNumber` |
| `dos` | `text` | not null | `dos` |
| `payer` | `text` | not null | `payer` |
| `comment` | `varchar(255)` | not null | `comment` |
| `deny_code` | `text` | nullable FK | `denyCode` |
| `done` | `boolean` | not null | `done` |
| `who_changed` | `text` | not null | `whoChanged` |
| `date_changed` | `text` | not null | `dateChanged` |

`billing_records.deny_code` references `deny_code_definitions.term`. The
definition rows must therefore be seeded before the billing records.

Suggested schema:

```sql
CREATE TABLE deny_code_definitions (
  term text PRIMARY KEY,
  definition text NOT NULL
);

CREATE TABLE billing_records (
  id text PRIMARY KEY,
  patient_number text NOT NULL,
  dos text NOT NULL,
  payer text NOT NULL,
  comment varchar(255) NOT NULL,
  deny_code text REFERENCES deny_code_definitions(term),
  done boolean NOT NULL,
  who_changed text NOT NULL,
  date_changed text NOT NULL
);
```

For a repeatable local reset, `schema.sql` should drop the dependent records
table before the definitions table, then recreate both:

```sql
DROP TABLE IF EXISTS billing_records;
DROP TABLE IF EXISTS deny_code_definitions;
```

This reset script is for local development only and must be run intentionally.

## Phase 1 — PostgreSQL preflight

1. Determine whether PostgreSQL will run locally or in Docker.
2. Confirm the server is reachable.
3. Create a dedicated local database and development user.
4. Construct a connection string:

   ```text
   postgresql://USER:PASSWORD@localhost:5432/billing_demo
   ```

5. Add it to an ignored backend environment file as `DATABASE_URL`.
6. Add a sanitized `apps/backend/.env.example` with no real password.
7. Confirm a command-line connection succeeds before changing Nest.

**Checkpoint:** a simple `SELECT 1;` succeeds outside the application.

## Phase 2 — Install backend dependencies

Planned backend dependencies:

```text
pg
@nestjs/config
```

Install TypeScript declarations for `pg` as a development dependency if the
installed driver version requires them.

`@nestjs/config` loads the ignored backend environment file and provides typed,
injectable access to `DATABASE_URL`. It should be registered globally once in
`AppModule`.

**Checkpoint:** the backend builds before database code is introduced.

## Phase 3 — Create and seed the schema

1. Create `apps/backend/database/schema.sql`.
2. Create `apps/backend/database/seed.sql`.
3. Seed the three existing definitions plus ten additional demonstration codes.
4. Seed the four existing billing rows plus sixteen additional fictional rows.
5. Seed definitions first because records reference them.
6. Run both files against the dedicated local database.
7. Verify row counts:

   ```sql
   SELECT count(*) FROM deny_code_definitions; -- 13
   SELECT count(*) FROM billing_records;       -- 20
   ```

8. Verify the nullable record remains nullable:

   ```sql
   SELECT id, deny_code FROM billing_records WHERE id = 'r4';
   ```

**Checkpoint:** PostgreSQL contains 13 definitions and 20 records.

## Phase 4 — Add the Nest database provider

Create a small global `DatabaseModule` and `DatabaseService`.

Responsibilities of `DatabaseService`:

- Construct exactly one `pg.Pool` from `DATABASE_URL`.
- Fail with a clear configuration error if `DATABASE_URL` is missing.
- Expose a typed `query(text, values)` method.
- Optionally verify connectivity with `SELECT 1` during application startup.
- Close the pool during Nest application shutdown.
- Avoid logging connection strings or query parameter values.

Conceptual interface:

```ts
query<Row>(text: string, values?: unknown[]): Promise<QueryResult<Row>>
```

The module exports `DatabaseService` so both feature modules can inject it.

Testing requirements:

- Unit tests must not connect to a real database.
- Mock `Pool` or isolate pool construction behind an injectable provider.
- Verify query delegation and pool shutdown behavior.

**Checkpoint:** Nest starts successfully with PostgreSQL running and fails with
a useful error when configuration or connectivity is missing.

## Phase 5 — Migrate definitions reads

Change `DefinitionsService.findOne()` from a synchronous dictionary lookup to
an asynchronous parameterized query:

```sql
SELECT term, definition
FROM deny_code_definitions
WHERE term = $1;
```

Required behavior remains:

- Known term returns `TermDefinition`.
- Unknown term returns `null` from the service.
- The controller converts `null` to `404 Not Found`.

Signature changes:

```text
DefinitionsService.findOne(term)
  TermDefinition | null
  -> Promise<TermDefinition | null>

DefinitionsController.findOne(term)
  TermDefinition
  -> Promise<TermDefinition>
```

Update controller/service unit tests to inject a mocked `DatabaseService`.
Do not require PostgreSQL for normal unit-test execution.

**Checkpoint:** direct Nest requests and Next-proxied requests return the same
definition text as before; unknown codes still return `404`.

## Phase 6 — Migrate records reads

Change `RecordsService.findAll()` to query PostgreSQL. Use SQL aliases to keep
the existing API contract:

```sql
SELECT
  id,
  patient_number AS "patientNumber",
  dos,
  payer,
  comment,
  deny_code AS "denyCode",
  done,
  who_changed AS "whoChanged",
  date_changed AS "dateChanged"
FROM billing_records
ORDER BY id;
```

Signature changes:

```text
RecordsService.findAll()
  BillingRecord[]
  -> Promise<BillingRecord[]>

RecordsController.findAll()
  BillingRecord[]
  -> Promise<BillingRecord[]>
```

The explicit `ORDER BY` makes API output deterministic. Unit tests mock the
database response and verify the query result is returned.

**Checkpoint:** `GET /api/records` returns 20 records with the exact existing
camelCase JSON fields and `r4.denyCode === null`.

## Phase 7 — Test strategy

### Fast unit tests (default suite)

- `DatabaseService` delegates queries and closes its pool.
- `DefinitionsService` passes the term as `$1`, returns the first row, and
  returns `null` for zero rows.
- `RecordsService` returns database rows.
- Controllers await their services and preserve existing HTTP behavior.
- Database dependencies are mocked; no local PostgreSQL requirement.

### Database integration test (optional separate command)

A separate integration test may connect to the local test database and verify:

- The schema applies cleanly.
- Seed counts are correct.
- `CO-45` can be retrieved.
- `UNKNOWN` is absent.
- All 20 records map to the expected API shape.

Do not put a required external-database dependency in the ordinary unit-test
command.

### Manual end-to-end checks

With PostgreSQL, Nest, and Next running:

1. `GET http://localhost:3001/api/records` returns 20 records.
2. `GET http://localhost:3001/api/definitions/CO-45` returns `200`.
3. `GET http://localhost:3001/api/definitions/UNKNOWN` returns `404`.
4. The corresponding Next endpoints on port 3000 behave identically.
5. `/billing` renders all records.
6. Table and detail-panel definition triggers load modal content.
7. The null deny-code row remains non-clickable.
8. Stopping PostgreSQL produces a controlled backend error rather than stale
   in-memory data.

## Phase 8 — Cutover and cleanup

Only after all checks pass:

1. Delete `src/records/records.data.ts`.
2. Delete `src/definitions/definitions.data.ts`.
3. Remove all imports of `initialRecords` and `initialDefinitions`.
4. Confirm no production source imports frontend `sampleRecords`.
5. Retain explicit test fixtures where unit/component tests need records.
6. Update the main build plan status to describe PostgreSQL + `pg`, not Prisma.
7. Document local database setup and reset commands in the backend README.

## Acceptance checklist

- [ ] No Prisma or other ORM dependency is installed.
- [ ] PostgreSQL setup is reproducible from documented steps.
- [ ] Schema and seed SQL are committed and reviewable.
- [ ] Secrets remain outside Git.
- [ ] Nest uses one shared connection pool.
- [ ] External query values are parameterized.
- [ ] Records endpoint reads exclusively from PostgreSQL.
- [ ] Definitions endpoint reads exclusively from PostgreSQL.
- [ ] Public JSON contracts are unchanged.
- [ ] Unknown definitions still return `404`.
- [ ] Unit tests run without PostgreSQL.
- [ ] Optional database integration checks pass.
- [ ] Frontend tests pass.
- [ ] Backend tests pass.
- [ ] Backend in-memory data files are removed after cutover.

## Deferred follow-up: editing/write path

After this plan is complete, implement:

```text
PATCH /api/records/:id
```

That later phase should add request DTO validation, parameterized `UPDATE`,
audit-field stamping, transactions where necessary, and frontend commit/error
behavior. None of those concerns should be mixed into the read-only database
cutover.

## Reference documentation

- Nest database integration:
  <https://docs.nestjs.com/techniques/database>
- Nest custom providers:
  <https://docs.nestjs.com/fundamentals/custom-providers>
- node-postgres connections:
  <https://node-postgres.com/features/connecting>
- node-postgres pooling:
  <https://node-postgres.com/features/pooling>
- node-postgres parameterized queries:
  <https://node-postgres.com/features/queries>
- node-postgres suggested project structure:
  <https://node-postgres.com/guides/project-structure>

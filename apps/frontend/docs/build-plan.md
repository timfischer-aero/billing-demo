# TanStack Table Demo — Build Plan

A three-page Next.js demo showcasing an Access-datasheet-style record browser built on TanStack Table v9. Portfolio/demo piece, runs locally only.

---

## Architecture at a glance

```
┌─────────────────────────────────────────────┐
│  Left sidebar (persistent, in root layout)   │
│  - nav: About  |  User  |  App                │
│  - current user indicator (read-only)         │
├──────────────┬──────────────────────────────┤
│              │  Page: /        about (home)  │
│              │  Page: /user    select + view │
│   sidebar    │                 saved settings │
│              │  Page: /billing heavy view    │
│              │    ┌────────────────────────┐  │
│              │    │ Detail panel (selected)│  │
│              │    ├────────────────────────┤  │
│              │    │ TanStack table (grid)  │  │
│              │    └────────────────────────┘  │
└──────────────┴──────────────────────────────┘

Data flow (wave 1):
  Client (table) ──fetch──▶ /api/records (route handler) ──▶ static data
  Client (table) ──fetch──▶ /api/definitions/[term]      ──▶ static data

Data flow (wave 2):
  same client ── same fetch ──▶ route handler ──▶ NestJS API ──▶ Postgres
```

The route handler is the seam. In wave 2 only the route handler changes what it talks to; the client is untouched.

---

## Decisions locked

- **Framework:** Next.js, App Router, TypeScript, Tailwind.
- **Table:** TanStack Table **v9** (pin the exact version in package.json; lean on official v9 docs for API specifics).
- **Middle layer:** static data behind Route Handlers (`/api/records`, `/api/definitions`). Client does real async fetching from day one.
- **Records are shared** across users — the records layer is *not* user-scoped.
- **Per-user state = the view only:** column visibility, sorting, column filters.
- **Persistence:** localStorage, keyed by userId. Survives refresh. No server-side state.
- **Deployment:** none. Local machine only.
- **Selected row:** not persisted (default). Detail panel starts empty on load/switch.
- **Domain:** billing data (model presented at build time; naturally carries jargon columns for the definition popups).
- **Pages (3):** `/` about (home), `/user` select active user + view saved settings + clear saved view, `/app` two-panel heavy view.
- **User selection** lives on `/user`, not the sidebar. Sidebar is pure nav + a read-only current-user indicator.
- **Clear settings:** deletes `demo:viewState:<userId>`; that user's view falls back to defaults on next load.

---

## Data contract (define before building UI)

```ts
// The record — shape matches what the real API will eventually return
type DemoRecord = {
  id: string;
  // ...domain fields TBD (see Open items)
};

// A clickable term's definition
type TermDefinition = {
  term: string;
  definition: string;
};

// Hardcoded user identity (no auth, no passwords)
type DemoUser = {
  id: string;
  name: string;
  color?: string;
};

// Per-user saved view state (persisted to localStorage)
type ViewState = {
  columnVisibility: Record<string, boolean>;
  sorting: { id: string; desc: boolean }[];       // TanStack SortingState shape
  columnFilters: { id: string; value: unknown }[]; // ColumnFiltersState shape
};

// Records middle layer — NO userId (records are shared)
getRecords(): Promise<DemoRecord[]>
getDefinition(term: string): Promise<TermDefinition | null>
```

localStorage keys:
- `demo:selectedUserId` → `string`
- `demo:viewState:<userId>` → serialized `ViewState`

---

## Phased plan

### Phase 0 — Scaffold
- `create-next-app` with App Router + TS + Tailwind.
- Pin TanStack Table v9 in package.json.
- Set up folder structure: `app/` (about/home), `app/user/` (user page), `app/billing/` (heavy view), `app/api/records/`, `app/api/definitions/`, `lib/` (middle layer + types), `data/` (static data), `components/`.

### Phase 1 — Layout & routing shell
- Root `layout.tsx` with the persistent left sidebar.
- Three routes: `/` (about/home), `/user` (select + settings), `/app` (heavy view).
- Nav links with active state; read-only current-user indicator slot in the sidebar. Placeholder content in all three pages.
- **Milestone:** three-page flow clicks back and forth, sidebar stays put.

### Phase 2 — Data contract & static data
- Author the TS types above.
- Create static records data matching the real-API shape.
- Create static term definitions.
- Stand up `/api/records` and `/api/definitions/[term]` route handlers serving the static data.
- Middle-layer functions call the route handlers.
- **Milestone:** hitting the endpoints in the browser returns the expected JSON.

### Phase 3 — User identity & the `/user` page
- Hardcode 3–4 users in a static file.
- `/user` page: select the active user → sets "current user" in React Context.
- Persist `demo:selectedUserId` to localStorage; hydrate on load.
- Sidebar current-user indicator reflects the active user.
- Display that user's saved settings (readable form of their `ViewState`). Empty/defaults state when they have none saved yet.
- Clear action: deletes `demo:viewState:<userId>` for that user.
- **Milestone:** pick a user, refresh, same user is still active; the sidebar shows them; their saved settings display; clear removes them.
- *(The settings display is meaningful only once view state exists — Phase 6 — so it can start as a stub here and fill in then.)*

### Phase 4 — Table core
- Wire TanStack Table v9 to records via the middle layer.
- Render the dense Access-style grid.
- Row selection lifts the selected record into shared state.
- **Milestone:** clicking a row marks it selected.

### Phase 5 — Detail panel
- Top panel renders the selected record.
- Clean empty state when nothing is selected.
- **Milestone:** row select populates the detail panel; two-panel layout is functional.

### Phase 6 — Table power features + per-user persistence
- Column visibility toggles.
- Per-column sorting.
- Per-column filtering.
- Hold `columnVisibility` / `sorting` / `columnFilters` as controlled state, fed into the table instance with the matching change handlers (confirm the exact v9 state/handler API against the docs).
- `useViewState(userId)` hook: hydrate from `demo:viewState:<userId>` on user switch, write back on every change.
- **Milestone:** set a view, refresh → restored; switch user → their own view loads; switch back → yours returns.

### Phase 7 — Term-definition popups
- Clickable term cells open a definition modal (fetched via `getDefinition`).
- Decide deliberately: does clicking a term also select the row, or is it isolated? (Recommend isolated — distinct gesture from row-select.)
- **Milestone:** clicking a term shows its definition without disturbing selection.

### Phase 8 — Polish
- Loading / error / empty states across fetches.
- Keyboard nav in the grid.
- Focus management + escape-to-close in the modal.
- Visual pass on the Access-datasheet density.

### Phase 9 — Backend swap (wave 2)
- Build NestJS API + local Postgres.
- Repoint the route handlers at the real API.
- **If Phases 2–8 held the contract, no UI code changes.**

---

## Open items

- **Domain of the data (TBD).** Blocks the concrete `DemoRecord` fields, the columns, and which columns carry clickable terms. Doesn't block Phases 0–1. Pick before Phase 2.
- **Which columns get definition popups.** Falls out of the domain choice.
- **Selected-row persistence.** Currently *off*. Revisit if you want the detail panel to survive refresh.
- **Wave-2 auth note.** When real auth arrives, `userId` comes from a session server-side. Because records aren't user-scoped, this only affects *where the view-state is stored* (moves from localStorage toward the user's row in Postgres), not the records fetch.

## Data Structure Outline

Editing happens only in the top detail panel; the bottom table is read-only and reflects committed values. Text/select fields commit on blur; the Done checkbox commits immediately. On any commit the system stamps `WhoChanged` (current user) and `DateChanged` (now) — these are display-locked to the user.

### Billing Info (`DemoRecord`)
- **id** — string — *system, not editable* — primary key. Row identity, selection key, and update key. Not `PatientNumber` (a patient has multiple rows).
- **Payer** — string — *editable* — name of payer. (This was the open "maybe" — flip to locked if payer shouldn't be changed here.)
- **PatientNumber** — string — *locked* — identifies the claim. String, not number (no math on it; preserves leading zeros).
- **DOS** — string, `MM/DD/YYYY`, date-only — *locked* — date of service. Kept as a plain string; never parsed into a `Date` (avoids the timezone-off-by-one trap).
- **Comment** — string, ≤255 — *editable (commit-on-blur)* — biller comment.
- **DenyCode** — string, nullable — *editable (commit-on-blur)* — FK to Deny Codes. Clicking the value in the table launches the definition popup. Empty/null when the row isn't denied (no popup).
- **Done** — boolean (bit) — *editable in detail panel (immediate)* — completion flag. Rendered as a **disabled** checkbox in the table (read-only there).
- **WhoChanged** — string — *system, display-locked* — name of the last person to change the record.
- **DateChanged** — datetime (ISO string) — *system, display-locked* — when the record was last changed.

### User Info (`DemoUser`)
- **id** — string — stable key. Used for `demo:selectedUserId` and `demo:viewState:<id>`. Never keyed on name.
- **FirstName** — string, 255
- **LastName** — string, 255

> View preferences are **not** stored on the user record in wave 1. They live in localStorage as `ViewState`, keyed by user id (see below). Wave 2 may migrate them onto the user's Postgres row.

### Deny Codes (`TermDefinition`)
- **Code** — string — the deny code (the clickable term).
- **Def** — string — longer text definition shown in the popup.

### View State (per-user, localStorage — not on the user record)
- **columnVisibility** — which columns are shown/hidden
- **sorting** — active sort order
- **columnFilters** — active per-column filters

### Storage behavior (wave 1)
- **Records** — shared/global, held in a mutable store behind the route handler (`GET /api/records`, `PATCH /api/records/:id`). Edits are global and visible to every user; `updateRecord(id, changes)` stamps the locked fields. Edits survive refresh but reset on server restart.
- **View state** — per-user, in localStorage keyed by user id. Cleared via the reset action on `/user`.
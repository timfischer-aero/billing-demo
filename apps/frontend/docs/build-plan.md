# TanStack Table Demo — Build Plan

A three-page Next.js demo showcasing an Access-datasheet-style record browser built on TanStack Table v9. Portfolio/demo piece, runs locally only.

**Status:** Viewing track essentially complete. Outstanding: deny-code definition popups, the editing/write track, and Phase 8 polish. See "Current status" below.

---

## Architecture at a glance

```
┌─────────────────────────────────────────────┐
│  Left sidebar (persistent, in root layout)   │
│  - nav: About  |  User  |  Billing            │
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

Data flow (wave 1, current):
  Client (table) ── props ──▶ static sample data (in-repo)
  (Route-handler seam not yet built — see Phase 2 status.)

Data flow (wave 1, planned):
  Client ──fetch──▶ /api/records (route handler) ──▶ static data
  Client ──fetch──▶ /api/definitions/[term]      ──▶ static data

Data flow (wave 2):
  same client ── same fetch ──▶ route handler ──▶ NestJS API ──▶ Postgres
```

The route handler is the seam. In wave 2 only the route handler changes what it talks to; the client is untouched.

---

## Current status (as-built)

**Done:**
- Three-page routing shell, persistent sidebar with live current-user indicator.
- Home/about page; `/user` page with selection, saved-settings display, clear-settings, and clear-user-selection.
- Detail panel (static, presentational) with the three field groups.
- TanStack v9 grid: row selection → detail panel, sorting, per-column filtering (with toggle-able filter row), column sizing (fixed layout, visibility-safe colgroup), column visibility menu (Patient # locked visible, show-all/hide-all).
- **Per-user view persistence** (the big one): sort/filter/visibility hoisted to a `ViewStateProvider`, persisted to localStorage per user, displayed and clearable on `/user`.
- Billing grid **gated behind user selection** — no user ⇒ a prompt, grid never mounts.

**Outstanding:**
- **Deny-code definition popups** (Phase 7) — the clickable-term popover in grid + detail panel. Not started. Independent of editing.
- **Editing / write track** — detail-panel fields committing changes, mutable store + `updateRecord`, audit-field stamping. Not started.
- **Route-handler seam** (Phase 2) — records currently come from a static import passed as props, *not* through `/api/records` yet. Needs building before/with the editing track (a PATCH needs somewhere to write).
- **Phase 8 polish** — loading/error states, keyboard nav, focus management.
- **Wave 2** — NestJS + Postgres.

---

## Decisions locked

- **Framework:** Next.js, App Router, TypeScript, Tailwind.
- **Table:** TanStack Table **v9** (pinned; official v9 docs are authoritative for API).
- **Middle layer:** static data behind Route Handlers (`/api/records`, `/api/definitions`). *(Planned; not yet built — see status.)*
- **Records are shared** across users — the records layer is *not* user-scoped.
- **Per-user state = the view only:** column visibility, sorting, column filters.
- **Persistence:** localStorage, keyed by userId. Survives refresh. No server-side state.
- **Deployment:** none. Local machine only.
- **Selected row:** not persisted. Detail panel starts on the first record; selection does not follow the user.
- **Domain:** billing data.
- **Pages (3):** `/` about (home), `/user` select active user + view/clear saved settings, `/billing` two-panel heavy view.
- **User selection** lives on `/user`, not the sidebar. Sidebar is pure nav + a read-only current-user indicator.
- **Clear settings:** deletes `demo:viewState:<userId>`; that user's view falls back to defaults.

### As-built architectural decisions (emerged during build)

- **Separate `ViewStateProvider`**, nested inside `SelectedUserProvider` — *not* folded into one session provider. Rationale: view state is high-churn (changes every sort/filter keystroke) and would drag unrelated consumers into re-renders; keeping it separate preserves single-responsibility and a clean one-way dependency (view state depends on user, never the reverse). Legibility weighted as a portfolio-quality concern.
- **Atoms (`@tanstack/react-store`)** as the state primitive for the three view slices — passed to `useTable` via its `atoms` option, and shared between the grid (writes) and `/user` (reads) through the provider. Chosen for consistency with the visibility atom already in use and fine-grained subscriptions. Atom API: `.get()` / `.set()` / `.subscribe()`; read reactively in components via `useSelector`.
- **Grid gated behind user selection** — `/billing` shows a "select a user" prompt when `selectedUserId` is null; the grid never mounts without a user. Resolves the "what do view settings mean with no user" ambiguity structurally.
- **No-user view settings are ephemeral** — with no user, grid changes live only in the in-memory atoms: they survive navigation (provider stays mounted) but not refresh (save effect bails when userId is null) and are overwritten when a user is selected (load effect resets/loads). Accepted as correct: no-user is a neutral state, and its tinkering shouldn't leak into a real user's saved view. *(Now largely moot given the gate above.)*
- **Column widths** via v9 `columnSizingFeature` (`size` on column defs, read with `getSize()`), rendered through a `<colgroup>` driven by `getVisibleLeafColumns()` so widths stay correct under column hiding. `table-fixed` layout so the filter-row toggle doesn't reflow widths.
- **Filter-row auto-open** — the billing grid opens the filter row on load if the current user has active filters (derived, not persisted — the display toggle is UI state, not saved `ViewState`).

---

## Data contract

```ts
type DemoRecord = {
  id: string;
  patientNumber: string;
  dos: string;              // MM/DD/YYYY, date-only, kept as string
  payer: string;
  comment: string;
  denyCode: string | null;
  done: boolean;
  whoChanged: string;       // see parked decision below
  dateChanged: string;
};

type TermDefinition = { term: string; definition: string };

type DemoUser = { id: string; firstName: string; lastName: string };

type ViewState = {
  columnVisibility: Record<string, boolean>;
  sorting: { id: string; desc: boolean }[];
  columnFilters: { id: string; value: unknown }[];
};

// Records middle layer — NO userId (records are shared)
getRecords(): Promise<DemoRecord[]>
getDefinition(term: string): Promise<TermDefinition | null>
```

localStorage keys:
- `demo:selectedUserId` → `string`
- `demo:viewState:<userId>` → serialized `ViewState`

---

## Phased plan (with status)

- **Phase 0 — Scaffold.** ✅ Done. (Monorepo: `apps/frontend`, `apps/api` to come. `src/` layout: `app/`, `components/`, `context/`, `data/`.)
- **Phase 1 — Layout & routing shell.** ✅ Done.
- **Phase 2 — Data contract & static data + route handlers.** ⚠️ Partial. Types + static sample data done; records currently imported as props. `/api/records` + `/api/definitions` route handlers **not yet built** — needed for the editing write path.
- **Phase 3 — User identity & `/user` page.** ✅ Done (selection, persistence, saved-settings display, clear, clear-selection).
- **Phase 4 — Table core (selection).** ✅ Done.
- **Phase 5 — Detail panel.** ✅ Done (static/presentational; editing is a separate track).
- **Phase 6 — Table power features + per-user persistence.** ✅ Done (sorting, filtering, visibility, sizing, and the `ViewStateProvider` persistence).
- **Phase 7 — Term-definition (deny-code) popups.** ❌ Outstanding. Lightweight popover, opens in place in both grid and detail panel. Isolated from row-select.
- **Editing / write track.** ❌ Outstanding. See "Data Structure Outline" for intended behavior. Depends on Phase 2's route handler (mutable store + PATCH).
- **Phase 8 — Polish.** ❌ Outstanding.
- **Phase 9 — Backend swap (wave 2).** ❌ Outstanding.

---

## Open items

- **`whoChanged` — id vs. display string (PARKED).** Currently a display string. Decision deferred to the editing track: should it store a `DemoUser` id (references the users list, lines up with edit-stamping the current user's id) or a display string? Leaning id, since editing will stamp the current user's id from context. Settle when building editing.
- **DOS sorting/storage.** Kept as `MM/DD/YYYY` string, sorted alphanumerically — lexically fine within one year, not truly chronological. If dates ever span years, move to ISO `YYYY-MM-DD` storage (sorts correctly as a string, stays timezone-safe) and format for display.
- **Route-handler seam not yet built.** Records are a static import today. Standing up `/api/records` (GET + PATCH) is the first real step of the editing track.
- **Wave-2 auth note.** When real auth arrives, `userId` comes from a session server-side. Because records aren't user-scoped, this only affects *where* view-state is stored (localStorage → user's Postgres row), not the records fetch.

---

## Data Structure Outline

Editing happens only in the top detail panel; the bottom table is read-only and reflects committed values. Text/select fields commit on blur; the Done checkbox commits immediately. On any commit the system stamps `WhoChanged` (current user) and `DateChanged` (now) — display-locked to the user.

### Billing Info (`DemoRecord`)
- **id** — string — *system, not editable* — primary key. Row identity, selection key, update key. Not `PatientNumber` (a patient has multiple rows).
- **Payer** — string — *editable* — name of payer. (Open "maybe" — flip to locked if it shouldn't be changed here.)
- **PatientNumber** — string — *locked* — identifies the claim. String, not number (no math; preserves leading zeros).
- **DOS** — string, `MM/DD/YYYY`, date-only — *locked* — kept as a plain string; never parsed into a `Date`.
- **Comment** — string, ≤255 — *editable (commit-on-blur)*.
- **DenyCode** — string, nullable — *editable (commit-on-blur)* — FK to Deny Codes. Clicking the value launches the definition popup. Null when not denied (no popup).
- **Done** — boolean — *editable in detail panel (immediate)* — disabled checkbox in the table (read-only there).
- **WhoChanged** — string — *system, display-locked* — see parked id-vs-string decision.
- **DateChanged** — datetime (ISO string) — *system, display-locked*.

### User Info (`DemoUser`)
- **id** — string — stable key for `demo:selectedUserId` and `demo:viewState:<id>`. Never keyed on name.
- **FirstName** / **LastName** — string.

> View preferences are **not** on the user record. They live in localStorage as `ViewState` keyed by user id. Wave 2 may migrate them onto the user's Postgres row.

### Deny Codes (`TermDefinition`)
- **Code** — string — the deny code (clickable term).
- **Def** — string — longer definition shown in the popup.

### View State (per-user, localStorage)
- **columnVisibility** / **sorting** / **columnFilters**.

### Storage behavior (wave 1, planned for editing track)
- **Records** — shared/global, mutable store behind the route handler (`GET /api/records`, `PATCH /api/records/:id`). Edits global; `updateRecord(id, changes)` stamps the locked fields. Edits survive refresh, reset on server restart.
- **View state** — per-user, localStorage keyed by user id. Cleared via `/user`.
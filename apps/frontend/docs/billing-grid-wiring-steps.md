# Billing Grid — Wiring Steps (TanStack Table v9)

Ordered plan for turning the static `/billing` grid shell into a working, per-user-persistent table. Each step is a small, independently testable increment. Follows Phases 4–7 of the build plan and the billing page design spec.

> **API note:** These steps give the *sequence* and the *concepts* each step needs. The exact TanStack Table **v9** API surface — package name, hook name, column-def shape, state-binding option names, which row models to enable — must be confirmed against the official v9 docs. Steps flagged **(v9 detail)** are where that applies. Steps flagged **(plain React)** don't depend on the table library.

---

## Step 1 — Install TanStack Table + make the grid a Client Component
- Install the v9 table package. **(v9 detail — confirm exact package name.)**
- Add `"use client"` to the top of `RecordsGrid.tsx`. The table hook holds state internally, so the grid must be a client component from here on.
- Nothing visual changes. This step only crosses the client boundary.

## Step 2 — Define the column model (don't render through it yet)
- Replace the hand-rolled `columns` array with TanStack column definitions (`accessorKey` / `header` / `cell` shape). **(v9 detail.)**
- Feed `DemoRecord[]` + the column defs into the table hook. **(v9 detail — hook name/signature.)**
- Keep rendering the existing hand-written `<table>` markup for now.
- Verify the table instance exists and holds the data (log it). Splitting "instance exists" from "render through it" isolates failures.

## Step 3 — Render through TanStack's row model
- Swap the `records.map(...)` body for the table's row model, and the header markup for the table's header groups. **(v9 detail — row model / header group access.)**
- Should look identical to the shell (same 7 columns, same data) — now driven by the instance.
- **Milestone:** the shell is now a real table. Good place to pause and confirm render.

## Step 4 — Row selection → lift the selected record up  *(plain React)*
- Selected-record state lives in `page.tsx`, not the grid (the detail panel is a sibling of the grid, not a child).
- `page.tsx` holds `selectedId`; passes it to the grid (highlight) and uses it to pick the record for the detail panel.
- Grid takes an `onSelectRow` callback prop, calls it on row click.
- This makes `page.tsx` a client component.
- **Milestone:** working two-panel app — select a row, detail panel updates. Satisfying stopping point.

## Step 5 — Sorting  *(v9 detail)*
- Bind sorting state; enable the sorted row model; make header clicks toggle sort.
- The header sort-arrow affordance already exists from the shell — now it reflects real state.

## Step 6 — Column filtering + filter-row toggle  *(v9 detail)*
- Wire the per-column filter inputs to column-filter state.
- Make the Filters button flip `showFilters` (now real state, not a const) — brings the collapsed-by-default filter row to life.

## Step 7 — Column visibility  *(v9 detail)*
- Wire the Columns dropdown to visibility state, initialized to the 7-column default.
- This is where "all columns available, horizontal scroll if many shown" gets real. Default visibility map = what Clear resets to.

## Step 8 — Per-user persistence  *(plain React + localStorage)*
- Sorting + filters + visibility are now live table state → persist them to localStorage keyed by current user (`useViewState(userId)` from the build plan), reading the selected user from context.
- Payoff: ties the billing page back to the user system. Unblocks the `/user` page's "saved settings" display and the Clear button.
- **Milestone:** the full per-user-view feature is complete.

## Step 9 — Deny-code popover  *(plain React)*
- Independent of table mechanics — do last.
- Click a deny code (grid or detail panel) → open a popover with the definition (from the Deny Codes data).
- Pick popover approach at this point.

---

## Suggested session breaks
- **Steps 1–3 together** — this is where the v9 API details cluster; do them with the docs open.
- **Pause after Step 4** — genuinely working two-panel app.
- **Pause after Step 8** — per-user view feature complete.
- **Step 9** — discrete add-on, any time.

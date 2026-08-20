# Billing Page — Design Spec

UI and interaction decisions for the `/billing` heavy view. Companion to the build plan; this covers *what the page is*, the build plan covers *when it gets built*. All decisions below are confirmed and buildable.

---

## Layout — two panels, stacked

- **Top: detail panel** — editable view of the single selected record.
- **Bottom: records grid** — read-only, Access-datasheet-style list of all records.
- Selecting a row in the grid populates the detail panel above it.
- The grid is read-only; edits happen only in the detail panel. The grid row reflects committed values.

---

## Detail panel (top)

One record at a time. Fields are labeled, multiple fields per row, organized into three groups:

### Group 1 — Claim identity (locked)
- **Patient number** — locked (identifies the claim)
- **Date of service (DOS)** — locked, `MM/DD/YYYY`, date-only
- **Payer** — locked *(decision: treated as claim-identifying; if it should be editable, it moves to Group 2 and renders as a live input)*
- Rendered with muted styling + a group-level lock indicator to signal non-editable.

### Group 2 — Editable work fields
- **Comment** — editable, ≤255 chars, commit-on-blur
- **Deny code** — editable, commit-on-blur; also a click target that opens the definition popover (see below)
- **Done** — editable here (immediate commit), checkbox
- Rendered as live inputs, visually distinct from the locked groups.

### Group 3 — System audit (locked, system-set)
- **Changed by** — set by the system to the current user on commit
- **Changed on** — set by the system to "now" on commit
- Rendered quiet/muted (small text, no input chrome) to signal system-owned. Separated from the editable fields by a divider.

### Commit behavior
- Text/select fields commit on **blur**.
- The Done checkbox commits **immediately** on click.
- On any commit, the system stamps Changed by + Changed on. These display-locked fields are never edited by the user.

---

## Records grid (bottom)

Read-only, dense, Microsoft Access datasheet feel.

### Columns
- **Default visible (7):** Done, Patient #, DOS, Payer, Deny code, Comment, Changed by.
- **All other columns** (e.g. full Changed-on timestamp, record id if shown) start **hidden** but are available via the Columns toggle.
- The default-visible set is the `columnVisibility` baseline used when a user has no saved view — and the state that Clear resets back to. A defined default visibility map is required (not just "show all").

### Column controls
- **Columns toggle** — a toolbar dropdown to show/hide columns.
- **Sort** — click a column header to sort by it; header shows sort direction.
- **Filters** — a toggle in the toolbar reveals/hides a filter row under the headers. Collapsed by default; when off, the filter row is hidden. Filter inputs sit per-column in that row.

### Cell rendering
- **Done** — checkbox glyph (checked/unchecked), rendered **disabled** (read-only in the grid).
- **Deny code** — rendered as a clickable/linked value; clicking opens the definition popover near the cell. When a row has no deny code (null), render an em dash (—) with no popover.
- **Selected row** — highlighted; its record drives the detail panel above.

### Horizontal scroll
- When enough columns are shown to exceed width, the **grid scrolls horizontally**.
- Scroll is scoped to a wrapper **around the table only** — never the whole page — so the detail panel stays fixed in place while the datasheet scrolls sideways.

---

## Deny-code definition popover

- Lightweight **popover** (not a full modal) so the user keeps context of the whole record.
- Opens **in place**, next to the clicked code — in **both** surfaces:
  - the grid (near the clicked cell), and
  - the detail panel (next to the deny-code field).
- Popover placement in the detail panel: below-and-left of the field (as mocked).
- Content: the code + its longer definition (from the Deny Codes data). Dismissible.

---

## Per-user view state (recap — see build plan / data model)

The grid's `columnVisibility`, `sorting`, and `columnFilters` are the per-user `ViewState`, persisted to localStorage keyed by user id. Records themselves are shared/global. This page is where that view state is produced and consumed; the `/user` page displays and clears it.

---

## Build order (this page)

1. Static presentational JSX + Tailwind — page layout + detail panel first, then the grid shell — hardcoded sample rows, **no** TanStack, no state.
2. TanStack Table wired underneath the grid shell (v9).
3. Row selection → detail panel.
4. Column controls (visibility, sort, filter) + per-user persistence.
5. Deny-code popover.

(Matches Phases 4–7 of the build plan.)
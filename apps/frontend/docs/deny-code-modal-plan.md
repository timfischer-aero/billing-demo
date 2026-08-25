# Deny-Code Definition Modal — Implementation Plan

Hand-off spec for building the deny-code definition feature in the billing demo
(Next.js App Router + TypeScript + Tailwind, TanStack Table v9). This is Phase 7
of the build plan ("term-definition popups"). Self-contained; does NOT depend on
the editing track or the route-handler seam.

## Decision (locked)

- **Centered modal** (NOT an anchored popover), because definitions run 3–5
  sentences and read better in a centered panel than floating off a table cell.
- **Library: Headless UI `Dialog`** (`@headlessui/react`). Chosen so focus-trap,
  scroll-lock, Esc-to-close, backdrop, and return-focus come for free (these are
  otherwise deferred a11y polish). Styles with Tailwind classes, matches the
  existing stack.
- **Pass the CODE (id), not the text.** Triggers pass the deny code string
  (e.g. `"CO-45"`); the modal looks up its own definition via a helper. Text
  lives in exactly one place. Same "store the id, derive the rest" pattern used
  elsewhere in this project (selected user id, `row.original.id`).
- **Isolated from row selection.** Clicking a deny code opens the modal but must
  NOT select the table row — use `stopPropagation` on the trigger.
- **Null handling.** Records with `denyCode === null` render an em dash (—) and
  are NOT clickable (no modal). `getDefinition` returning null for an unknown
  code must degrade gracefully ("No definition available"), never crash.

## Prerequisite

Install the library (frontend workspace):
```
pnpm add @headlessui/react
# or from repo root:
pnpm add --filter frontend @headlessui/react
```

---

## Step 1 — Fake definitions data + lookup helper

Create `src/data/denyCodes.ts`. Shape matches the `TermDefinition` contract
(`{ term, definition }`) so it's swap-ready for the real API in wave 2.

```ts
// src/data/denyCodes.ts
export type TermDefinition = { term: string; definition: string };

// Keyed by deny code. Definitions are 3–5 sentences (placeholder text).
const denyCodeDefinitions: Record<string, TermDefinition> = {
  "CO-45": {
    term: "CO-45",
    definition:
      "Charge exceeds the fee schedule, maximum allowable amount, or the " +
      "contracted/legislated fee arrangement. The amount billed is above what " +
      "the payer's contract permits for this service. The excess is a " +
      "contractual adjustment and is not billable to the patient. No further " +
      "action is typically required beyond writing off the difference.",
  },
  "PR-1": {
    term: "PR-1",
    definition:
      "The amount applied to the patient's deductible. The patient has not yet " +
      "met their plan deductible for the benefit period, so this portion of the " +
      "charge is the patient's responsibility. Bill the patient for the " +
      "indicated amount. This is a patient-responsibility code, not a denial.",
  },
  "CO-97": {
    term: "CO-97",
    definition:
      "The benefit for this service is included in the payment/allowance for " +
      "another service that has already been adjudicated. This is a bundling " +
      "adjustment — the payer considers the service part of a broader procedure. " +
      "Review the primary procedure code to confirm correct bundling. If the " +
      "service was distinct, a corrected claim with an appropriate modifier may " +
      "be warranted.",
  },
  // Add more codes as needed to cover the sample records.
};

// Look up a definition by code. Returns null for unknown codes.
export function getDefinition(code: string): TermDefinition | null {
  return denyCodeDefinitions[code] ?? null;
}
```

NOTE: make sure every `denyCode` value used in `src/data/records.ts` has an
entry here (except null). Codes currently in the sample data: CO-45, PR-1, CO-97.

---

## Step 2 — Modal open-state, lifted to the billing page

The modal is a single page-level overlay; many triggers feed it. State is just
"which code is open" (a string, or null = closed). Because the table's deny-code
cell is rendered inside a TanStack column def (defined at module scope, outside
the component), the cleanest way to reach the opener from the cell is a small
context — NOT prop-threading into the column defs.

Create `src/context/DefinitionModalContext.tsx`:

```tsx
"use client";
import { createContext, useContext, useState } from "react";

type DefinitionModalContextValue = {
  openCode: string | null;
  openDefinition: (code: string) => void;
  closeDefinition: () => void;
};

const DefinitionModalContext =
  createContext<DefinitionModalContextValue | undefined>(undefined);

export function DefinitionModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openCode, setOpenCode] = useState<string | null>(null);
  const openDefinition = (code: string) => setOpenCode(code);
  const closeDefinition = () => setOpenCode(null);

  return (
    <DefinitionModalContext.Provider
      value={{ openCode, openDefinition, closeDefinition }}
    >
      {children}
    </DefinitionModalContext.Provider>
  );
}

export function useDefinitionModal() {
  const ctx = useContext(DefinitionModalContext);
  if (ctx === undefined) {
    throw new Error(
      "useDefinitionModal must be used within a DefinitionModalProvider"
    );
  }
  return ctx;
}
```

Wrap the billing page (or the app) in `DefinitionModalProvider`. Scoping it to
the billing page is fine since that's the only place deny codes appear; wrapping
higher (in the root layout) also works. If placed in the billing page, it wraps
the page's returned JSX and the `<DefinitionModal />` from Step 3.

---

## Step 3 — The DefinitionModal component (Headless UI Dialog)

Create `src/app/billing/DefinitionModal.tsx`. Rendered ONCE, at the billing page
level. Reads `openCode` from context, looks up the text, displays it.

```tsx
"use client";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useDefinitionModal } from "@/context/DefinitionModalContext";
import { getDefinition } from "@/data/denyCodes";

export default function DefinitionModal() {
  const { openCode, closeDefinition } = useDefinitionModal();

  const isOpen = openCode !== null;
  const definition = openCode ? getDefinition(openCode) : null;

  return (
    <Dialog open={isOpen} onClose={closeDefinition} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Centered container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {openCode}
          </DialogTitle>

          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            {definition
              ? definition.definition
              : `No definition available for ${openCode}.`}
          </p>

          <div className="mt-5 text-right">
            <button
              type="button"
              onClick={closeDefinition}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
```

Headless UI `Dialog` handles Esc-to-close, backdrop click-to-close (via
`onClose`), focus trap, scroll lock, and return-focus automatically. The
`onClose` fires on both Esc and backdrop click, so `closeDefinition` covers both.

Render `<DefinitionModal />` once inside the `DefinitionModalProvider` on the
billing page (e.g. at the end of the page's JSX, as a sibling of the detail
panel and grid). It renders nothing visible when `openCode` is null.

---

## Step 4 — Wire the triggers

### 4a. Table deny-code cell (`src/app/billing/RecordsGrid.tsx`)

The `denyCode` column's `cell` renderer currently renders a static span. It must
become a clickable trigger. BUT: the column defs live at module scope and can't
call the `useDefinitionModal` hook directly. Solution — render a small trigger
COMPONENT in the cell that itself calls the hook:

Create a tiny component (can live in RecordsGrid.tsx or its own file):

```tsx
"use client";
import { useDefinitionModal } from "@/context/DefinitionModalContext";

function DenyCodeCell({ code }: { code: string | null }) {
  const { openDefinition } = useDefinitionModal();
  if (!code) return <span className="text-gray-400">—</span>;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation(); // do NOT select the row
        openDefinition(code);
      }}
      className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
    >
      {code}
    </button>
  );
}
```

Then the column def's cell becomes:
```tsx
cell: (info) => <DenyCodeCell code={info.getValue() as string | null} />,
```

`stopPropagation` is essential — the row `<tr>` has an `onClick` that selects the
row; without it, clicking a code would ALSO select the row. Keep it isolated.

### 4b. Detail panel deny-code field (`src/app/billing/DetailPanel.tsx`)

The detail panel shows the selected record's deny code. Make that value a
clickable trigger too, using the same hook. There's no row-selection conflict
here (not in the table), so `stopPropagation` isn't strictly needed, but harmless
to include. Reuse `DenyCodeCell` or inline the same button pattern:

```tsx
const { openDefinition } = useDefinitionModal();
// ...where the deny code renders:
record.denyCode ? (
  <button
    type="button"
    onClick={() => openDefinition(record.denyCode!)}
    className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
  >
    {record.denyCode}
  </button>
) : (
  <span className="text-gray-400">—</span>
)
```

NOTE: the detail panel is currently presentational and may not be a client
component that can call hooks. If it isn't already `"use client"`, adding this
hook makes it one — fine, since the billing page is already client-side.

---

## Test checklist

1. Click a deny code in the TABLE → modal opens centered with that code's 3–5
   sentence definition; the row is NOT selected (detail panel unchanged).
2. Click the deny code in the DETAIL PANEL → same modal opens with the same
   definition.
3. Esc closes the modal. Clicking the dark backdrop closes it. Close button
   closes it.
4. A record with `denyCode === null` shows an em dash and is not clickable.
5. (Optional) Temporarily point a record at a code with no definition entry →
   modal shows "No definition available for X" rather than crashing.

## Notes for the implementing agent

- The project uses a `src/` layout with `@/` aliased to `./src/*`. Imports use
  `@/data/...`, `@/context/...`, `@/app/billing/...`.
- Records are static sample data (`src/data/records.ts`), passed as props — NOT
  yet behind a route handler. `getDefinition` is a plain sync function for now;
  the contract's async `getDefinition(): Promise<TermDefinition | null>` is the
  wave-2 shape, not required here.
- Do NOT wire the modal into the editing track — it's read-only display of a
  definition, fully independent.
- If the detail panel deny-code field is inside a group of "editable work
  fields" with an input, the clickable definition trigger is separate from any
  future edit control. For now the detail panel is presentational, so just make
  the displayed code clickable.
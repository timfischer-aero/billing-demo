// src/app/page.tsx
import Link from "next/link";

const demonstrates = [
  "An Access-datasheet-style grid with per-column show/hide, sorting, and filtering",
  "An editable detail panel that commits on blur and writes back to the shared record",
  "System-stamped audit fields (who changed a record, and when) that stay locked to the user",
  "Per-user saved views — your columns, sort, and filters persist across refreshes",
  "Clickable deny codes that open an inline definition popup",
  "A swappable data layer: static data today, a NestJS + Postgres API later, with no UI changes",
];

export default function HomePage() {
  return (
    <div className="max-w-3xl">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Billing Worklist
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          A demo record browser modeled on a Microsoft Access datasheet — a
          shared billing worklist with an editable detail view, per-user saved
          layouts, and a backend you can swap without touching the UI.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-lg font-medium">What this demonstrates</h2>
        <ul className="mt-3 space-y-2 text-gray-700">
          {demonstrates.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden className="text-gray-400">
                –
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">How it's built</h2>
        <p className="mt-3 text-gray-700">
          Next.js with the App Router and Tailwind on the front end, TanStack
          Table v9 for the grid. The front end talks to a thin route-handler
          layer rather than to data directly — in this first pass that layer
          serves static data, and it's designed to later point at a separate
          NestJS API backed by a local Postgres database without any changes
          above it.
        </p>
      </section>

      <section className="mt-10 rounded-md border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">About the data:</span>{" "}
          the billing records shown here are a sample extraction used for
          demonstration only — they are not real patient data and contain no
          real personal or health information.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Get started</h2>
        <p className="mt-3 text-gray-700">
          Start by choosing a user — the grid remembers each user's saved
          layout, so the app needs to know who you are first. Then open the
          billing worklist.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <Link
            href="/user"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            1 · Select a user
          </Link>
          <Link
            href="/billing"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            2 · Open the billing worklist
          </Link>
        </div>
      </section>
    </div>
  );
}
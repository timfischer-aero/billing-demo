import Link from "next/link";
import type { ReactNode } from "react";

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-blue-700 underline decoration-blue-200 underline-offset-2 hover:text-blue-900"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export default function HomePage() {
  return (
    <div className="max-w-3xl">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Billing Worklist
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          A full-stack billing worklist demo modeled on a Microsoft Access
          datasheet workflow. It combines a configurable records grid with
          persistent editing, denial-code reference tools, system-managed audit
          information, and per-user saved layouts.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-lg font-medium">What this demonstrates</h2>
        <ul className="mt-3 space-y-2 text-gray-700">
          <li className="flex gap-2">
            <span aria-hidden className="text-gray-400">
              –
            </span>
            <span>
              An Access-style grid with column visibility, sorting, filtering,
              result counts, and an empty-results state
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-gray-400">
              –
            </span>
            <span>
              A detail panel with controlled editing: comments save on blur,
              while denial codes and Done status save immediately
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-gray-400">
              –
            </span>
            <span>
              Persistent record updates through a Next.js-to-Nest API path
              backed by PostgreSQL
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-gray-400">
              –
            </span>
            <span>
              Server-stamped audit fields displayed as friendly user names and
              readable timestamps
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-gray-400">
              –
            </span>
            <span>
              Per-user grid layouts that persist across browser refreshes
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-gray-400">
              –
            </span>
            <span>
              Database-driven denial-code options with definitions displayed in
              an accessible dialog
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-gray-400">
              –
            </span>
            <span>
              Save-state feedback and rollback behavior when an update fails
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-gray-400">
              –
            </span>
            <span>
              Frontend and backend unit tests covering API clients, validation,
              database services, controllers, and UI interactions
            </span>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">How it&apos;s built</h2>
        <div className="mt-3 space-y-3 text-gray-700">
          <p>
            The frontend uses{" "}
            <ExternalLink href="https://nextjs.org/">Next.js</ExternalLink>,{" "}
            <ExternalLink href="https://react.dev/">React</ExternalLink>,{" "}
            <ExternalLink href="https://www.typescriptlang.org/">
              TypeScript
            </ExternalLink>
            ,{" "}
            <ExternalLink href="https://tailwindcss.com/">
              Tailwind CSS
            </ExternalLink>
            , and{" "}
            <ExternalLink href="https://tanstack.com/table/latest">
              TanStack Table
            </ExternalLink>
            .{" "}
            <ExternalLink href="https://tanstack.com/store/latest">
              TanStack Store
            </ExternalLink>{" "}
            manages the grid&apos;s interactive view state.
          </p>

          <p>
            <ExternalLink href="https://headlessui.com/">
              Headless UI
            </ExternalLink>{" "}
            provides the accessible denial-code dialog, including focus
            management and keyboard behavior.
          </p>

          <p>
            Browser requests pass through Next.js route handlers to a{" "}
            <ExternalLink href="https://nestjs.com/">NestJS</ExternalLink> API.
            Nest validates update requests, executes parameterized SQL through{" "}
            <ExternalLink href="https://node-postgres.com/">
              node-postgres
            </ExternalLink>
            , and persists records and denial-code definitions in{" "}
            <ExternalLink href="https://www.postgresql.org/">
              PostgreSQL
            </ExternalLink>
            . Successful updates return the complete saved record so the detail
            panel, grid, and audit display stay synchronized.
          </p>

          <p>
            Frontend behavior is tested with{" "}
            <ExternalLink href="https://vitest.dev/">Vitest</ExternalLink> and{" "}
            <ExternalLink href="https://testing-library.com/">
              Testing Library
            </ExternalLink>
            . Nest services, controllers, and validation are tested with{" "}
            <ExternalLink href="https://jestjs.io/">Jest</ExternalLink> using
            mocked database dependencies.
          </p>
        </div>
      </section>

      <section className="mt-10 rounded-md border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">About the data:</span>{" "}
          all records, patient identifiers, payer names, comments, and
          denial-code activity shown in this application are fictional
          demonstration data. They do not represent real patients, claims, or
          protected health information.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Try the live demo</h2>
        <p className="mt-3 text-gray-700">
          Choose a demo user, then open the billing worklist. Select a row to
          edit its comment, denial code, or Done status. Try filtering and
          sorting the table, open a denial-code definition, and refresh the
          page to confirm that record updates and per-user layouts persist.
        </p>
        <p className="mt-3 text-sm text-gray-500">
          Demo user selection identifies who made an edit and which grid layout
          to load; it is not an authentication system.
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

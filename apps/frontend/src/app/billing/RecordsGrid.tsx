// src/app/billing/RecordsGrid.tsx
// Static presentational grid shell — no TanStack, no state, no handlers.
// Takes records + selectedId as props (page supplies them).
// Flip showFilters to true to preview the filter row (collapsed by default).
"use client";

import type { DemoRecord } from "@/data/records";

const showFilters = false; // becomes Filters-toggle state later

// The 7 default-visible columns. Order here drives the header + filter rows.
// (Body cells are rendered explicitly below to handle per-field formatting.)
const columns: { key: string; label: string; sortActive?: boolean }[] = [
  { key: "done", label: "Done" },
  { key: "patientNumber", label: "Patient #", sortActive: true },
  { key: "dos", label: "DOS" },
  { key: "payer", label: "Payer" },
  { key: "denyCode", label: "Deny code" },
  { key: "comment", label: "Comment" },
  { key: "whoChanged", label: "Changed by" },
];

export default function RecordsGrid({
  records,
  selectedId,
}: {
  records: DemoRecord[];
  selectedId: string | null;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
        <span className="text-base font-medium text-gray-900">Records</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-md border border-gray-300 px-2.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            Columns <span aria-hidden className="text-[10px]">▾</span>
          </button>
          <button
            type="button"
            className={[
              "flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs",
              showFilters
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50",
            ].join(" ")}
          >
            Filters
          </button>
        </div>
      </div>

      {/* Scroll wrapper — scoped to the grid so the detail panel stays put */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            {/* Header row — click-to-sort (inert in the shell) */}
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    "whitespace-nowrap border-b border-gray-200 px-2.5 py-2 font-medium text-gray-500",
                    col.key === "done" ? "w-11 text-center" : "text-left",
                  ].join(" ")}
                >
                  {col.label}
                  {col.key !== "done" && (
                    <span
                      aria-hidden
                      className={
                        col.sortActive
                          ? "ml-1 text-blue-600"
                          : "ml-1 text-gray-300"
                      }
                    >
                      {col.sortActive ? "↑" : "↕"}
                    </span>
                  )}
                </th>
              ))}
            </tr>

            {/* Filter row — collapsed by default (showFilters flag) */}
            {showFilters && (
              <tr className="bg-white">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="border-b border-gray-200 px-1.5 py-1.5"
                  >
                    {col.key !== "done" && (
                      <input
                        placeholder="filter…"
                        className="h-6 w-full rounded border border-gray-200 bg-gray-50 px-1.5 text-[11px] text-gray-600 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                      />
                    )}
                  </th>
                ))}
              </tr>
            )}
          </thead>

          <tbody>
            {records.map((r) => {
              const isSelected = r.id === selectedId;
              return (
                <tr
                  key={r.id}
                  className={isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
                >
                  {/* Done — disabled checkbox (read-only in the grid) */}
                  <td className="border-b border-gray-100 px-2 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={r.done}
                      disabled
                      readOnly
                      className="h-3.5 w-3.5"
                    />
                  </td>
                  <td className="whitespace-nowrap border-b border-gray-100 px-2.5 py-1.5 text-gray-900">
                    {r.patientNumber}
                  </td>
                  <td className="whitespace-nowrap border-b border-gray-100 px-2.5 py-1.5 text-gray-900">
                    {r.dos}
                  </td>
                  <td className="whitespace-nowrap border-b border-gray-100 px-2.5 py-1.5 text-gray-900">
                    {r.payer}
                  </td>
                  {/* Deny code — clickable-looking; em dash when null */}
                  <td className="whitespace-nowrap border-b border-gray-100 px-2.5 py-1.5">
                    {r.denyCode ? (
                      <span className="text-blue-600 underline underline-offset-2">
                        {r.denyCode}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="max-w-[150px] truncate border-b border-gray-100 px-2.5 py-1.5 text-gray-600">
                    {r.comment}
                  </td>
                  <td className="whitespace-nowrap border-b border-gray-100 px-2.5 py-1.5 text-gray-600">
                    {r.whoChanged}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
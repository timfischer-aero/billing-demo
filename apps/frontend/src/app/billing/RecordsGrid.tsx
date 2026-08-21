// src/app/billing/RecordsGrid.tsx
"use client";

import { tableFeatures, useTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { DemoRecord } from "@/data/records";

const features = tableFeatures({});

const columns: Array<ColumnDef<typeof features, DemoRecord>> = [
  {
    accessorKey: "done",
    header: "Done",
    cell: (info) => (
      <input
        type="checkbox"
        checked={info.getValue() as boolean}
        disabled
        readOnly
        className="h-3.5 w-3.5"
      />
    ),
  },
  {
    accessorKey: "patientNumber",
    header: "Patient #",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "dos",
    header: "DOS",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "payer",
    header: "Payer",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "denyCode",
    header: "Deny code",
    cell: (info) => {
      const code = info.getValue() as string | null;
      return code ? (
        <span className="text-blue-600 underline underline-offset-2">{code}</span>
      ) : (
        <span className="text-gray-400">—</span>
      );
    },
  },
  {
    accessorKey: "comment",
    header: "Comment",
    cell: (info) => (
      <span className="block max-w-[150px] truncate">{info.getValue() as string}</span>
    ),
  },
  {
    accessorKey: "whoChanged",
    header: "Changed by",
    cell: (info) => info.getValue(),
  },
];

const showFilters = true;

export default function RecordsGrid({
  records,
  selectedId,
}: {
  records: DemoRecord[];
  selectedId: string | null;
}) {
  const table = useTable({
    key: "billing-table",
    features,
    columns,
    data: records,
  });

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
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className="bg-gray-50" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={[
                      "whitespace-nowrap border-b border-gray-200 px-2.5 py-2 font-medium text-gray-500",
                      header.column.id === "done" ? "w-11 text-center" : "text-left",
                    ].join(" ")}
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </th>
                ))}
              </tr>
            ))}

            {showFilters &&
              table.getHeaderGroups().map((headerGroup) => (
                <tr className="bg-white" key={`filter-${headerGroup.id}`}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="border-b border-gray-200 px-1.5 py-1.5">
                      {header.column.id !== "done" && (
                        <input
                          placeholder="filter…"
                          className="h-6 w-full rounded border border-gray-200 bg-gray-50 px-1.5 text-[11px] text-gray-600 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                        />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => {
              const isSelected = row.original.id === selectedId;
              return (
                <tr
                  key={row.id}
                  className={isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
                >
                  {row.getAllCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap border-b border-gray-100 px-2.5 py-1.5 text-gray-900"
                    >
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
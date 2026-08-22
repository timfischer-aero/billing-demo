// src/app/billing/RecordsGrid.tsx
"use client";

import { 
  tableFeatures, 
  useTable,
  rowSortingFeature,
  createSortedRowModel,
  sortFn_alphanumeric,
  sortFn_text,
  sortFn_datetime,
  columnFilteringFeature,
  createFilteredRowModel,
  filterFn_includesString,
  columnSizingFeature,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { DemoRecord } from "@/data/records";
import { useState } from "react";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(), 
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
    datetime: sortFn_datetime,
  },
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(), // if using client-side filtering
  // manualFiltering: true, // if using manual server-side filtering
  filterFns: {
    includesString: filterFn_includesString,
  },
  columnSizingFeature,
});

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
    size: 44,
    enableColumnFilter: false,
  },
  {
    accessorKey: "patientNumber",
    header: "Patient #",
    cell: (info) => info.getValue(),
    filterFn: 'includesString',
    size: 112,
  },
  {
    accessorKey: "dos",
    header: "DOS",
    cell: (info) => info.getValue(),
    sortFn: 'alphanumeric',
    filterFn: 'includesString',
    size: 96,
  },
  {
    accessorKey: "payer",
    header: "Payer",
    cell: (info) => info.getValue(),
    sortFn: 'alphanumeric',
    filterFn: 'includesString',
    size: 160,
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
    sortFn: 'alphanumeric',
    filterFn: 'includesString',
    size: 96,
  },
  {
    accessorKey: "comment",
    header: "Comment",
    cell: (info) => (
      <span className="block truncate">{info.getValue() as string}</span>
    ),
    sortFn: 'alphanumeric',
    filterFn: 'includesString',
    size: 240,
  },
  {
    accessorKey: "whoChanged",
    header: "Changed by",
    cell: (info) => info.getValue(),
    sortFn: 'alphanumeric',
    filterFn: 'includesString',
    size: 112,
  },
];

export default function RecordsGrid({
  records,
  selectedId,
  onSelectRow,
}: {
  records: DemoRecord[];
  selectedId: string | null;
  onSelectRow: (id: string) => void;
}) {
  //Define table 
  const table = useTable({
    key: "billing-table",
    features,
    columns,
    data: records,
    initialState: {
    sorting: [
      {
        id: 'patientNumber',
        desc: true, 
      },
    ],
  },
  });
  
  //Setup component states
  
  const [showFilters, setShowFilters] = useState<boolean>(false);


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
            onClick={() => setShowFilters((v) => !v)}
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
        <table className="w-full min-w-[640px] border-collapse text-[13px] table-fixed">
          <colgroup>
            {table.getAllLeafColumns().map((column) => (
              <col key={column.id} style={{ width: `${column.getSize()}px` }} />
            ))}
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className="bg-gray-50" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted(); // "asc" | "desc" | false
                  const isFiltered = header.column.getIsFiltered();
                  return (
                    <th
                      key={header.id}
                      className={[
                        "whitespace-nowrap border-b border-gray-200 px-2.5 py-2 font-medium text-gray-500",
                        header.column.id === "done" ? "w-11 text-center" : "text-left",
                      ].join(" ")}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          onClick={header.column.getToggleSortingHandler()}
                          className={ [
                            "flex items-center gap-1",
                            canSort ? "cursor-pointer select-none" : "",
                            isFiltered ? "text-blue-600 font-semibold" : "",
                          ].join(" ")}
                        >
                          <table.FlexRender header={header} />
                          {isFiltered && (
                            <span aria-hidden title="Filtered" className="text-blue-600">⛁</span>
                          )}
                          {canSort && (
                            <span aria-hidden className={sorted ? "text-blue-600" : "text-gray-300"}>
                              {sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : "↕"}
                            </span>
                          )}
                        </div>
                      )}
                      </th>
                    );
                })}
              </tr>
            ))}

            {showFilters &&
              table.getHeaderGroups().map((headerGroup) => (
                <tr className="bg-white" key={`filter-${headerGroup.id}`}>
                  {headerGroup.headers.map((header) => {
                    const column = header.column;
                    const canFilter = column.getCanFilter();
                    return (
                      <th key={header.id} className="border-b border-gray-200 px-1.5 py-1.5">
                        {column.id !== "done" && canFilter && (
                          <input
                            value={(column.getFilterValue() ?? "") as string}
                            onChange={(e) => column.setFilterValue(e.target.value)}
                            placeholder="filter…"
                            onClick={(e) => e.stopPropagation()}
                            className="h-6 w-full rounded border border-gray-200 bg-gray-50 px-1.5 text-[11px] text-gray-600 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => {
              const isSelected = row.original.id === selectedId;
              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectRow(row.original.id) }
                  className={["cursor-pointer", isSelected ? "bg-blue-50" : "hover:bg-gray-50",].join(" ")}
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
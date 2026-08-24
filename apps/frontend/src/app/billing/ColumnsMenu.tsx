// src/app/billing/ColumnsMenu.tsx
"use client";

const placeholderColumns = [
  { id: "done", label: "Done", visible: true },
  { id: "dos", label: "DOS", visible: true },
  { id: "payer", label: "Payer", visible: true },
  { id: "denyCode", label: "Deny code", visible: false }, // shown unchecked to preview that state
  { id: "comment", label: "Comment", visible: true },
  { id: "whoChanged", label: "Changed by", visible: true },
];

export default function ColumnsMenu() {
    const open = true;

    return (
        <div className="relative">
        {/* Trigger button */}
        <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-md border border-gray-300 px-2.5 text-xs text-gray-600 hover:bg-gray-50"
        >
            Columns <span aria-hidden className="text-[10px]">▾</span>
        </button>

        {/* Popup — anchored under the button, right-aligned */}
        {open && (
            <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            {/* Show all / Hide all */}
            <div className="flex items-center gap-4 border-b border-gray-100 px-3 py-2">
                <button
                type="button"
                className="text-xs text-blue-600 hover:underline"
                >
                Show all
                </button>
                <button
                type="button"
                className="text-xs text-blue-600 hover:underline"
                >
                Hide all
                </button>
            </div>

            {/* Column checkbox list */}
            <div className="py-1">
                {placeholderColumns.map((col) => (
                <label
                    key={col.id}
                    className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-[13px] text-gray-800 hover:bg-gray-50"
                >
                    <input
                    type="checkbox"
                    checked={col.visible}
                    readOnly
                    className="h-4 w-4"
                    />
                    {col.label}
                </label>
                ))}
            </div>
            </div>
        )}
        </div>
    );
}
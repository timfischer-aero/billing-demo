// src/app/billing/ColumnsMenu.tsx
"use client";

import {useState, useRef, useEffect, useMemo} from "react";

export default function ColumnsMenu({table}: {table: any}) {
    const [open, setOpen] = useState<boolean>(false);
    const availCols = useMemo(() => table.getAllColumns().filter((item) => item.getCanHide()),
        [table]
    );
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return; // only listen while the menu is open

        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div className="relative" ref={menuRef}>
        {/* Trigger button */}
        <button
            type="button"
            onClick={() => setOpen((v) => !v)}
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
                onClick={ () => availCols.forEach((c) => c.toggleVisibility(true))}
                >
                Show all
                </button>
                <button
                type="button"
                className="text-xs text-blue-600 hover:underline"
                onClick={ () => availCols.forEach((c) => c.toggleVisibility(false))}
                >
                Hide all
                </button>
            </div>

            {/* Column checkbox list */}
            <div className="py-1">
                {availCols.map((col) => (
                <label
                    key={col.id}
                    className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-[13px] text-gray-800 hover:bg-gray-50"
                >
                    <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={col.getToggleVisibilityHandler()}
                    className="h-4 w-4"
                    />
                    {col.columnDef.header}
                </label>
                ))}
            </div>
            </div>
        )}
        </div>
    );
}
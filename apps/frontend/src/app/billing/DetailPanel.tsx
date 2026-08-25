// src/app/billing/DetailPanel.tsx
"use client"

import type { DemoRecord } from "@/data/records";
import { useDefinitionModal } from "@/context/DefinitionModalContext";

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-xs text-gray-500">{label}</div>
      <div className="flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
        {value}
      </div>
    </div>
  );
}

export default function DetailPanel({ record }: { record: DemoRecord }) {
  const { openDefinition } = useDefinitionModal();

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-base font-medium text-gray-900">Record detail</h2>
        <span className="text-xs text-gray-400">editing · commits on blur</span>
      </div>

      {/* Group 1 — Claim identity (locked) */}
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
        Claim identity · locked
      </p>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <LockedField label="Patient number" value={record.patientNumber} />
        <LockedField label="Date of service" value={record.dos} />
        <LockedField label="Payer" value={record.payer} />
      </div>

      {/* Group 2 — Editable work fields */}
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-blue-600">
        Editable work fields
      </p>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-gray-500">Comment</label>
          <textarea
            defaultValue={record.comment}
            rows={2}
            maxLength={255}
            className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Deny code</label>
          <div className="flex items-center gap-1">
            <input
              defaultValue={record.denyCode ?? ""}
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
            />
            <button
              type="button"
              aria-label="Deny code definition"
              disabled={record.denyCode === null}
              onClick={() => {
                if (record.denyCode !== null) {
                  openDefinition(record.denyCode);
                }
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 text-blue-600 hover:bg-gray-50"
            >
              <span aria-hidden className="text-sm font-medium">i</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" defaultChecked={record.done} className="h-4 w-4" />
          Done
        </label>
      </div>

      {/* Group 3 — System audit (locked, muted) */}
      <div className="border-t border-gray-100 pt-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
          System audit · locked
        </p>
        <div className="flex gap-6 text-xs text-gray-400">
          <span>
            Changed by <span className="text-gray-600">{record.whoChanged}</span>
          </span>
          <span>
            Changed on <span className="text-gray-600">{record.dateChanged}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
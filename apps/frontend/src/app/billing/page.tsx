// src/app/billing/page.tsx
"use client";

import {useState} from "react";
import DetailPanel from "./DetailPanel";
import RecordsGrid from "./RecordsGrid";
import { sampleRecords } from "@/data/records";

export default function BillingPage() {
  const [selectedId, setSelectedId] = useState<string | null>(sampleRecords[0].id);
  const selected = sampleRecords.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      {selected ? (
        <DetailPanel record={selected} />
      ) : (
        <section className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
          Select a record to get started
        </section>
      )}
      

      <RecordsGrid records={sampleRecords} selectedId={selectedId} onSelectRow={setSelectedId} />
    </div>
  );
}
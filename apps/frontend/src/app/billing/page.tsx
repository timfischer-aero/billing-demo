// src/app/billing/page.tsx
import DetailPanel from "./DetailPanel";
import RecordsGrid from "./RecordsGrid";
import { sampleRecords } from "@/data/records";

export default function BillingPage() {
  const selected = sampleRecords[0];

  return (
    <div className="flex flex-col gap-4">
      <DetailPanel record={selected} />
      <RecordsGrid records={sampleRecords} selectedId={selected.id} />
    </div>
  );
}
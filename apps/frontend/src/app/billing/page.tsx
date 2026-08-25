// src/app/billing/page.tsx
"use client";

import {useState} from "react";
import Link from "next/link";

import DetailPanel from "./DetailPanel";
import RecordsGrid from "./RecordsGrid";
import { sampleRecords } from "@/data/records";
import { useSelectedUser } from "@/context/SelectedUserContext";


export default function BillingPage() {
  const [selectedId, setSelectedId] = useState<string | null>(sampleRecords[0].id);
  const selected = sampleRecords.find((r) => r.id === selectedId) ?? null;
  const { selectedUserId } = useSelectedUser();

  if (selectedUserId === null) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
        <h2 className="text-lg font-medium text-gray-900">No user selected</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose a user to view their billing worklist — each user has their own
          saved layout.
        </p>
        <Link
          href="/user"
          className="mt-4 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Select a user
        </Link>
      </div>
    );
  }

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
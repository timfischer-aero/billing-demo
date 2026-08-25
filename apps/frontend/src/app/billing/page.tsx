// src/app/billing/page.tsx
"use client";

import { useEffect, useState} from "react";
import Link from "next/link";

import DetailPanel from "./DetailPanel";
import RecordsGrid from "./RecordsGrid";

import type { DemoRecord } from "@/data/records";
import { getRecords } from "@/data/recordsApi";

import { useSelectedUser } from "@/context/SelectedUserContext";
import { DefinitionModalProvider } from "@/context/DefinitionModalContext";
import DefinitionModal  from "./DefinitionModal";

export default function BillingPage() {
  const [records, setRecords] = useState<DemoRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selected =
    records.find((record) => record.id === selectedId) ?? null;

  const { selectedUserId } = useSelectedUser();


  useEffect(() => {
    if (selectedUserId === null) {
      return;
    }

    const controller = new AbortController();

    getRecords(controller.signal)
      .then((loadedRecords) => {
        setRecords(loadedRecords);

        setSelectedId((currentId) => {
          const currentRecordStillExists = loadedRecords.some(
            (record) => record.id === currentId,
          );

          if (currentRecordStillExists) {
            return currentId;
          }

          return loadedRecords[0]?.id ?? null;
        });
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          cause instanceof Error
            ? cause.message
            : "An unexpected error occurred while loading records.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [selectedUserId]);


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

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-500">
        Loading billing records…
      </div>
    );
  }

  if (error !== null) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
        <h2 className="font-medium text-red-900">
          Unable to load billing records
        </h2>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <DefinitionModalProvider>
      <div className="flex flex-col gap-4">
        {selected ? (
          <DetailPanel record={selected} />
        ) : (
          <section className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
            Select a record to get started
          </section>
        )}
        
        <RecordsGrid records={records} selectedId={selectedId} onSelectRow={setSelectedId} />
      </div>
      <DefinitionModal />
    </DefinitionModalProvider>
  );
}
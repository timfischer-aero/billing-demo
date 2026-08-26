// src/app/billing/page.tsx
"use client";

//Packages
import { useEffect, useState} from "react";
import Link from "next/link";

//Components
import DetailPanel from "./DetailPanel";
import RecordsGrid from "./RecordsGrid";
import DefinitionModal  from "./DefinitionModal";

//API
import { fetchDefinitions } from "@/data/definitionsApi";
import { getRecords } from "@/data/recordsApi";

//Types
import type { TermDefinition } from "@/data/denyCodes";
import type { DemoRecord } from "@/data/records";

//Context Imports
import { useSelectedUser } from "@/context/SelectedUserContext";
import { DefinitionModalProvider } from "@/context/DefinitionModalContext";

export default function BillingPage() {
  const [records, setRecords] = useState<DemoRecord[]>([]);
  const [definitions, setDefinitions] = useState<TermDefinition[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selected =
    records.find((record) => record.id === selectedId) ?? null;

  function handleRecordUpdated(updatedRecord: DemoRecord) {
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === updatedRecord.id
          ? updatedRecord
          : record,
      ),
    );
  }

  const { selectedUserId } = useSelectedUser();

  //Pull records on selectedUserId updates
  useEffect(() => {
    if (selectedUserId === null) {
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    Promise.all([
      getRecords(controller.signal),
      fetchDefinitions(controller.signal),
    ])
      .then(([loadedRecords, loadedDefinitions]) => {
        setRecords(loadedRecords);
        setDefinitions(loadedDefinitions);

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
            : "An unexpected error occurred while loading billing data.",
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
          Unable to load billing data
        </h2>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <DefinitionModalProvider>
      <div className="flex flex-col gap-4">
        {selected ? (
          <DetailPanel
            key={selected.id}
            record={selected}
            definitions={definitions}
            actorUserId={selectedUserId}
            onRecordUpdated={handleRecordUpdated}
          />
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
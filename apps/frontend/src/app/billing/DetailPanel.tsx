// src/app/billing/DetailPanel.tsx
"use client"

import type { DemoRecord } from "@/data/records";
import { useDefinitionModal } from "@/context/DefinitionModalContext";
import type { TermDefinition } from "@/data/denyCodes";
import { useState } from "react";
import { updateRecord } from "@/data/recordsApi";

type SavingField =
  | "comment"
  | "denyCode"
  | "done"
  | null;

type DetailPanelProps = {
  record: DemoRecord;
  definitions: TermDefinition[];
  actorUserId: string;
  onRecordUpdated: (updatedRecord: DemoRecord) => void;
};

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

export default function DetailPanel({
  record,
  definitions,
  actorUserId,
  onRecordUpdated,
}: DetailPanelProps) {
  const { openDefinition } = useDefinitionModal();

  const [denyCode, setDenyCode] = useState(record.denyCode ?? "");
  const [comment, setComment] = useState(record.comment);
  const [done, setDone] = useState(record.done);
  const [savedComment, setSavedComment] = useState(record.comment);
  const [savingField, setSavingField] = useState<SavingField>(null);

  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleDenyCodeChange(nextDenyCode: string) {
      if (nextDenyCode === denyCode || savingField !== null) {
        return;
      }

      const previousDenyCode = denyCode;

      setDenyCode(nextDenyCode);
      setSavingField("denyCode");
      setSaveError(null);

      try {
        const updatedRecord = await updateRecord(record.id, {
          denyCode:
            nextDenyCode === "" ? null : nextDenyCode,
          actorUserId,
        });

        onRecordUpdated(updatedRecord);
        setDenyCode(updatedRecord.denyCode ?? "");
      } catch (cause: unknown) {
        setDenyCode(previousDenyCode);
        setSaveError(
          cause instanceof Error
            ? cause.message
            : "Unable to save the denial code.",
        );
      } finally {
        setSavingField(null);
      }
  }

  async function handleCommentBlur() {
    if (
      comment === savedComment ||
      savingField !== null
    ) {
      return;
    }

    setSavingField("comment");
    setSaveError(null);

    try {
      const updatedRecord = await updateRecord(record.id, {
        comment,
        actorUserId,
      });

      onRecordUpdated(updatedRecord);
      setComment(updatedRecord.comment);
      setSavedComment(updatedRecord.comment);
    } catch (cause: unknown) {
      setComment(savedComment);
      setSaveError(
        cause instanceof Error
          ? cause.message
          : "Unable to save the comment.",
      );
    } finally {
      setSavingField(null);
    }
  }

  async function handleDoneChange(nextDone: boolean) {
    if (
      nextDone === done ||
      savingField !== null
    ) {
      return;
    }

    const previousDone = done;

    setDone(nextDone);
    setSavingField("done");
    setSaveError(null);

    try {
      const updatedRecord = await updateRecord(record.id, {
        done: nextDone,
        actorUserId,
      });

      onRecordUpdated(updatedRecord);
      setDone(updatedRecord.done);
    } catch (cause: unknown) {
      setDone(previousDone);
      setSaveError(
        cause instanceof Error
          ? cause.message
          : "Unable to save the Done status.",
      );
    } finally {
      setSavingField(null);
    }
  }

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
            value={comment}
            disabled={savingField !== null}
            onChange={(event) => {
              setComment(event.target.value);
            }}
            onBlur={() => {
              void handleCommentBlur();
            }}
            rows={2}
            maxLength={255}
            className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="deny-code" className="mb-1 block text-xs text-gray-500">Deny code</label>
          <div className="flex items-center gap-1">
            <select
              id="deny-code"
              value={denyCode}
              disabled={savingField !== null}
              onChange={(event) => {
                void handleDenyCodeChange(event.target.value);
              }}
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">No denial code</option>

              {definitions.map((definition) => (
                <option
                  key={definition.term}
                  value={definition.term}
                >
                  {definition.term}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Deny code definition"
              disabled={denyCode === ""}
              onClick={() => {
                if (denyCode !== "") {
                  openDefinition(denyCode);
                }
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 text-blue-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              <span aria-hidden className="text-sm font-medium">i</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={done}
            disabled={savingField !== null}
            onChange={(event) => {
              void handleDoneChange(event.target.checked);
            }}
            className="h-4 w-4 disabled:cursor-not-allowed"
          />
          Done
        </label>
      </div>
      {savingField !== null ? (
        <p aria-live="polite" className="text-xs text-gray-500">
          Saving changes…
        </p>
      ) : null}

      {saveError !== null ? (
        <p role="alert" className="text-xs text-red-600">
          {saveError}
        </p>
      ) : null}

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
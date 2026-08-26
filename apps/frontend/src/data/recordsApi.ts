import type { DemoRecord } from "@/data/records";

export type UpdateRecordRequest = {
  comment?: string;
  denyCode?: string | null;
  done?: boolean;
  actorUserId: string;
};

function isDemoRecord(value: unknown): value is DemoRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  const denyCodeIsValid =
    candidate.denyCode === null ||
    typeof candidate.denyCode === "string";

  return (
    typeof candidate.id === "string" &&
    typeof candidate.patientNumber === "string" &&
    typeof candidate.dos === "string" &&
    typeof candidate.payer === "string" &&
    typeof candidate.comment === "string" &&
    denyCodeIsValid &&
    typeof candidate.done === "boolean" &&
    typeof candidate.whoChanged === "string" &&
    typeof candidate.dateChanged === "string"
  );
}

export async function getRecords(
  signal?: AbortSignal,
): Promise<DemoRecord[]> {
  const response = await fetch("/api/records", { signal });

  if (!response.ok) {
    throw new Error(`Unable to load records (${response.status}).`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("The records response was not an array.");
  }

  return data as DemoRecord[];
}

export async function updateRecord(
  id: string,
  request: UpdateRecordRequest,
  signal?: AbortSignal,
): Promise<DemoRecord> {
  const response = await fetch(
    `/api/records/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Unable to update record (${response.status}).`,
    );
  }

  const data: unknown = await response.json();

  if (!isDemoRecord(data)) {
    throw new Error("The updated record response was invalid.");
  }

  return data;
}
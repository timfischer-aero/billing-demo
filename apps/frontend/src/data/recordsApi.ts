import type { DemoRecord } from "@/data/records";

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
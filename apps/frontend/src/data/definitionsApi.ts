import type { TermDefinition } from '@/data/denyCodes';

function isTermDefinition(value: unknown): value is TermDefinition {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.term === 'string' &&
    typeof candidate.definition === 'string'
  );
}

export async function fetchDefinition(
  term: string,
  signal?: AbortSignal,
): Promise<TermDefinition | null> {
  const response = await fetch(
    `/api/definitions/${encodeURIComponent(term)}`,
    { signal },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Unable to load the definition (${response.status}).`,
    );
  }

  const data: unknown = await response.json();

  if (!isTermDefinition(data)) {
    throw new Error('The definition response was invalid.');
  }

  return data;
}
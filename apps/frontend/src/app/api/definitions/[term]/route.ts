const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3001';

export async function GET(
  _request: Request,
  context: RouteContext<'/api/definitions/[term]'>,
) {
  const { term } = await context.params;

  try {
    const response = await fetch(
      `${backendUrl}/api/definitions/${encodeURIComponent(term)}`,
      { cache: 'no-store' },
    );

    if (response.status === 404) {
      return Response.json(
        { error: `No definition available for ${term}.` },
        { status: 404 },
      );
    }

    if (!response.ok) {
      return Response.json(
        { error: 'The definitions service returned an error.' },
        { status: 502 },
      );
    }

    const definition: unknown = await response.json();

    return Response.json(definition);
  } catch {
    return Response.json(
      { error: 'The definitions service is unavailable.' },
      { status: 503 },
    );
  }
}
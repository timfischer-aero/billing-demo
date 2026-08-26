const backendUrl =
  process.env.BACKEND_URL ?? "http://localhost:3001";

export async function GET() {
  try {
    const response = await fetch(
      `${backendUrl}/api/definitions`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return Response.json(
        { error: "The definitions service returned an error." },
        { status: 502 },
      );
    }

    const definitions: unknown = await response.json();

    return Response.json(definitions);
  } catch {
    return Response.json(
      { error: "The definitions service is unavailable." },
      { status: 503 },
    );
  }
}
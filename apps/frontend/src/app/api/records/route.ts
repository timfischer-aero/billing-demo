const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3001";

export async function GET() {
  try {
    const response = await fetch(`${backendUrl}/api/records`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json(
        { error: "The records service returned an error." },
        { status: 502 },
      );
    }

    const records: unknown = await response.json();

    return Response.json(records);
  } catch {
    return Response.json(
      { error: "The records service is unavailable." },
      { status: 503 },
    );
  }
}
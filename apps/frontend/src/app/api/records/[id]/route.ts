const backendUrl =
  process.env.BACKEND_URL ?? "http://localhost:3001";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/records/[id]">,
) {
  const { id } = await context.params;

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return Response.json(
      { error: "The request body must contain valid JSON." },
      { status: 400 },
    );
  }

  let backendResponse: Response;

  try {
    backendResponse = await fetch(
      `${backendUrl}/api/records/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      },
    );
  } catch {
    return Response.json(
      { error: "The records service is unavailable." },
      { status: 503 },
    );
  }

  let responseBody: unknown;

  try {
    responseBody = await backendResponse.json();
  } catch {
    return Response.json(
      { error: "The records service returned an invalid response." },
      { status: 502 },
    );
  }

  if (!backendResponse.ok) {
    const status =
      backendResponse.status === 400 ||
      backendResponse.status === 404
        ? backendResponse.status
        : 502;

    return Response.json(responseBody, { status });
  }

  return Response.json(responseBody);
}
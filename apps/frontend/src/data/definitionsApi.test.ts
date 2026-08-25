import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchDefinition } from "@/data/definitionsApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchDefinition", () => {
  it("returns a valid definition", async () => {
    const responseBody = {
      term: "CO-45",
      definition: "Charge exceeds the fee schedule.",
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchDefinition("CO-45")).resolves.toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/definitions/CO-45",
      { signal: undefined },
    );
  });

  it("encodes the term before placing it in the URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ term: "CODE / 1", definition: "Definition" }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchDefinition("CODE / 1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/definitions/CODE%20%2F%201",
      { signal: undefined },
    );
  });

  it("returns null for a missing definition", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );

    await expect(fetchDefinition("UNKNOWN")).resolves.toBeNull();
  });

  it("throws when the response has an unsuccessful status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    );

    await expect(fetchDefinition("CO-45")).rejects.toThrow(
      "Unable to load the definition (503).",
    );
  });

  it("throws when the response does not match the contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ term: "CO-45" }), { status: 200 }),
      ),
    );

    await expect(fetchDefinition("CO-45")).rejects.toThrow(
      "The definition response was invalid.",
    );
  });
});

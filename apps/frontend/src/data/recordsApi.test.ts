import { afterEach, describe, expect, it, vi } from "vitest";

import { updateRecord } from "@/data/recordsApi";

const updatedRecord = {
  id: "r1",
  patientNumber: "P-0049217",
  dos: "03/14/2026",
  payer: "Blue Ridge Mutual",
  comment: "Updated comment",
  denyCode: null,
  done: false,
  whoChanged: "u1",
  dateChanged: "2026-08-26T03:19:57.662Z",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("updateRecord", () => {
  it("sends a PATCH request and returns the updated record", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(updatedRecord), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const request = {
      denyCode: null,
      done: false,
      actorUserId: "u1",
    };

    await expect(updateRecord("r1", request)).resolves.toEqual(
      updatedRecord,
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/records/r1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: undefined,
    });
  });

  it("encodes the record ID before placing it in the URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(updatedRecord), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await updateRecord("record / 1", {
      comment: "Updated comment",
      actorUserId: "u1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/records/record%20%2F%201",
      expect.any(Object),
    );
  });

  it("forwards an abort signal", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(updatedRecord), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    await updateRecord(
      "r1",
      { done: false, actorUserId: "u1" },
      controller.signal,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/records/r1",
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it("throws when the response has an unsuccessful status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );

    await expect(
      updateRecord("missing", {
        comment: "Updated comment",
        actorUserId: "u1",
      }),
    ).rejects.toThrow("Unable to update record (404).");
  });

  it("throws when the updated record does not match the contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ...updatedRecord,
            done: "not-a-boolean",
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(
      updateRecord("r1", {
        done: true,
        actorUserId: "u1",
      }),
    ).rejects.toThrow("The updated record response was invalid.");
  });
});

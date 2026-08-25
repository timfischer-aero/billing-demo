import { describe, expect, it } from "vitest";
import { getDefinition } from "@/data/denyCodes";

describe("getDefinition", () => {
  it.each(["CO-45", "PR-1", "CO-97"])(
    "returns the definition for %s",
    (code) => {
      const result = getDefinition(code);

      expect(result).not.toBeNull();
      expect(result?.term).toBe(code);
      expect(result?.definition).not.toHaveLength(0);
    },
  );

  it("returns null when the code is unknown", () => {
    expect(getDefinition("UNKNOWN")).toBeNull();
  });
});

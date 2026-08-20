import { describe, it, expect } from "vitest";
import { findUserById, type DemoUser } from "@/data/users";

const testUsers: DemoUser[] = [
  { id: "a1", firstName: "Ada", lastName: "Lovelace" },
  { id: "b2", firstName: "Grace", lastName: "Hopper" },
];

describe("findUserById", () => {
  it("returns the matching user when the id exists", () => {
    const result = findUserById("b2", testUsers);
    expect(result).toEqual({ id: "b2", firstName: "Grace", lastName: "Hopper" });
  });

  it("returns null when the id is not found", () => {
    expect(findUserById("zzz", testUsers)).toBeNull();
  });

  it("returns null when the id is null (no selection)", () => {
    expect(findUserById(null, testUsers)).toBeNull();
  });
});
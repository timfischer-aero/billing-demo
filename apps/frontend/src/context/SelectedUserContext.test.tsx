import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  SelectedUserProvider,
  useSelectedUser,
} from "@/context/SelectedUserContext";

const STORAGE_KEY = "demo:selectedUserId";

// The provider must wrap the hook, since useSelectedUser reads its context.
function wrapper({ children }: { children: React.ReactNode }) {
  return <SelectedUserProvider>{children}</SelectedUserProvider>;
}

describe("SelectedUserProvider", () => {
  // localStorage persists across tests in jsdom — clear it so each test starts clean.
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with no user selected", () => {
    const { result } = renderHook(() => useSelectedUser(), { wrapper });
    expect(result.current.selectedUserId).toBeNull();
  });

  it("persists the selected id to localStorage when a user is chosen", () => {
    const { result } = renderHook(() => useSelectedUser(), { wrapper });

    act(() => {
      result.current.setSelectedUserId("u2");
    });

    expect(result.current.selectedUserId).toBe("u2");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("u2");
  });

  it("clears the stored id when selection is set back to null", () => {
    const { result } = renderHook(() => useSelectedUser(), { wrapper });

    act(() => {
      result.current.setSelectedUserId("u3");
    });
    act(() => {
      result.current.setSelectedUserId(null);
    });

    expect(result.current.selectedUserId).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("hydrates from localStorage on mount", () => {
    // Simulate a prior session having saved a selection.
    localStorage.setItem(STORAGE_KEY, "u4");

    const { result } = renderHook(() => useSelectedUser(), { wrapper });

    expect(result.current.selectedUserId).toBe("u4");
  });
});
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DefinitionModalProvider,
  useDefinitionModal,
} from "@/context/DefinitionModalContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return <DefinitionModalProvider>{children}</DefinitionModalProvider>;
}

describe("DefinitionModalProvider", () => {
  it("starts closed", () => {
    const { result } = renderHook(() => useDefinitionModal(), { wrapper });

    expect(result.current.openCode).toBeNull();
  });

  it("opens a definition by code", () => {
    const { result } = renderHook(() => useDefinitionModal(), { wrapper });

    act(() => {
      result.current.openDefinition("CO-45");
    });

    expect(result.current.openCode).toBe("CO-45");
  });

  it("closes the active definition", () => {
    const { result } = renderHook(() => useDefinitionModal(), { wrapper });

    act(() => {
      result.current.openDefinition("PR-1");
    });
    act(() => {
      result.current.closeDefinition();
    });

    expect(result.current.openCode).toBeNull();
  });
});

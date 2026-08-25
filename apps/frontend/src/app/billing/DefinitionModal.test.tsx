import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  DefinitionModalProvider,
  useDefinitionModal,
} from "@/context/DefinitionModalContext";
import DefinitionModal from "./DefinitionModal";

function ModalTrigger({ code }: { code: string }) {
  const { openDefinition } = useDefinitionModal();

  return (
    <button type="button" onClick={() => openDefinition(code)}>
      Open {code}
    </button>
  );
}

function renderModal(code: string) {
  return render(
    <DefinitionModalProvider>
      <ModalTrigger code={code} />
      <DefinitionModal />
    </DefinitionModalProvider>,
  );
}

describe("DefinitionModal", () => {
  it("shows the requested definition", async () => {
    const user = userEvent.setup();
    renderModal("CO-45");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open CO-45" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "CO-45" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Charge exceeds the fee schedule/),
    ).toBeInTheDocument();
  });

  it("shows a fallback for an unknown code", async () => {
    const user = userEvent.setup();
    renderModal("UNKNOWN");

    await user.click(screen.getByRole("button", { name: "Open UNKNOWN" }));

    expect(
      screen.getByText("No definition available for UNKNOWN."),
    ).toBeInTheDocument();
  });

  it("closes from the Close button", async () => {
    const user = userEvent.setup();
    renderModal("PR-1");

    await user.click(screen.getByRole("button", { name: "Open PR-1" }));
    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderModal("CO-97");

    await user.click(screen.getByRole("button", { name: "Open CO-97" }));
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

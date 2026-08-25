import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DefinitionModalProvider } from "@/context/DefinitionModalContext";
import { SelectedUserProvider } from "@/context/SelectedUserContext";
import { ViewStateProvider } from "@/context/ViewStateContext";
import { sampleRecords, type DemoRecord } from "@/data/records";
import DefinitionModal from "./DefinitionModal";
import DetailPanel from "./DetailPanel";
import RecordsGrid from "./RecordsGrid";

vi.mock("@/data/definitionsApi", () => ({
  fetchDefinition: vi.fn(async (term: string) => ({
    term,
    definition: `Definition for ${term}`,
  })),
}));

function renderDetailPanel(record: DemoRecord) {
  return render(
    <DefinitionModalProvider>
      <DetailPanel record={record} />
      <DefinitionModal />
    </DefinitionModalProvider>,
  );
}

function renderGrid(records: DemoRecord[], onSelectRow = vi.fn()) {
  const result = render(
    <SelectedUserProvider>
      <ViewStateProvider>
        <DefinitionModalProvider>
          <RecordsGrid
            records={records}
            selectedId={records[0]?.id ?? null}
            onSelectRow={onSelectRow}
          />
          <DefinitionModal />
        </DefinitionModalProvider>
      </ViewStateProvider>
    </SelectedUserProvider>,
  );

  return { ...result, onSelectRow };
}

describe("deny-code modal triggers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens the selected record's definition from the detail panel", async () => {
    const user = userEvent.setup();
    renderDetailPanel(sampleRecords[1]);

    await user.click(
      screen.getByRole("button", { name: "Deny code definition" }),
    );

    expect(
      screen.getByRole("heading", { name: "PR-1" }),
    ).toBeInTheDocument();
  });

  it("disables the detail trigger when the record has no deny code", () => {
    renderDetailPanel(sampleRecords[3]);

    expect(
      screen.getByRole("button", { name: "Deny code definition" }),
    ).toBeDisabled();
  });

  it("opens a definition from the grid without selecting its row", async () => {
    const user = userEvent.setup();
    const onSelectRow = vi.fn();
    renderGrid([sampleRecords[0]], onSelectRow);

    await user.click(screen.getByRole("button", { name: "CO-45" }));

    expect(
      screen.getByRole("heading", { name: "CO-45" }),
    ).toBeInTheDocument();
    expect(onSelectRow).not.toHaveBeenCalled();
  });

  it("renders a null grid code as non-clickable text", () => {
    renderGrid([sampleRecords[3]]);

    expect(screen.getByText("—")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Deny code definition" }),
    ).not.toBeInTheDocument();
  });
});

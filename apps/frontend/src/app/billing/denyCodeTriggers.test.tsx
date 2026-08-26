import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DefinitionModalProvider } from "@/context/DefinitionModalContext";
import { SelectedUserProvider } from "@/context/SelectedUserContext";
import { ViewStateProvider } from "@/context/ViewStateContext";
import type { TermDefinition } from "@/data/denyCodes";
import { sampleRecords, type DemoRecord } from "@/data/records";
import { updateRecord } from "@/data/recordsApi";
import DefinitionModal from "./DefinitionModal";
import DetailPanel from "./DetailPanel";
import RecordsGrid from "./RecordsGrid";

vi.mock("@/data/definitionsApi", () => ({
  fetchDefinition: vi.fn(async (term: string) => ({
    term,
    definition: `Definition for ${term}`,
  })),
}));

vi.mock("@/data/recordsApi", () => ({
  updateRecord: vi.fn(),
}));

const updateRecordMock = vi.mocked(updateRecord);

const definitions: TermDefinition[] = [
  { term: "CO-45", definition: "Definition for CO-45" },
  { term: "PR-1", definition: "Definition for PR-1" },
];

function renderDetailPanel(record: DemoRecord) {
  const onRecordUpdated = vi.fn();
  const result = render(
    <DefinitionModalProvider>
      <DetailPanel
        record={record}
        definitions={definitions}
        actorUserId="u1"
        onRecordUpdated={onRecordUpdated}
      />
      <DefinitionModal />
    </DefinitionModalProvider>,
  );

  return { ...result, onRecordUpdated };
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
    updateRecordMock.mockReset();
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

  it("saves a changed comment when the textarea loses focus", async () => {
    const user = userEvent.setup();
    const updatedRecord = {
      ...sampleRecords[0],
      comment: "Corrected claim submitted.",
      whoChanged: "u1",
      dateChanged: "2026-08-26T12:00:00.000Z",
    };
    updateRecordMock.mockResolvedValue(updatedRecord);
    const { onRecordUpdated } = renderDetailPanel(sampleRecords[0]);
    const textarea = screen.getByRole("textbox");

    await user.clear(textarea);
    await user.type(textarea, "Corrected claim submitted.");
    await user.tab();

    expect(updateRecordMock).toHaveBeenCalledWith("r1", {
      comment: "Corrected claim submitted.",
      actorUserId: "u1",
    });
    await waitFor(() => {
      expect(onRecordUpdated).toHaveBeenCalledWith(updatedRecord);
    });
    expect(textarea).toHaveValue("Corrected claim submitted.");
  });

  it("does not save an unchanged comment on blur", async () => {
    const user = userEvent.setup();
    renderDetailPanel(sampleRecords[0]);
    const textarea = screen.getByRole("textbox");

    await user.click(textarea);
    await user.tab();

    expect(updateRecordMock).not.toHaveBeenCalled();
  });

  it("restores the saved comment when updating it fails", async () => {
    const user = userEvent.setup();
    updateRecordMock.mockRejectedValue(
      new Error("Unable to update record (503)."),
    );
    const { onRecordUpdated } = renderDetailPanel(sampleRecords[0]);
    const textarea = screen.getByRole("textbox");

    await user.clear(textarea);
    await user.type(textarea, "This update will fail.");
    await user.tab();

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Unable to update record (503).");
    expect(textarea).toHaveValue(sampleRecords[0].comment);
    expect(onRecordUpdated).not.toHaveBeenCalled();
  });

  it("saves a selected denial code and reports the updated record", async () => {
    const user = userEvent.setup();
    const updatedRecord = {
      ...sampleRecords[0],
      denyCode: "PR-1",
      whoChanged: "u1",
      dateChanged: "2026-08-26T12:00:00.000Z",
    };
    updateRecordMock.mockResolvedValue(updatedRecord);
    const { onRecordUpdated } = renderDetailPanel(sampleRecords[0]);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Deny code" }),
      "PR-1",
    );

    expect(updateRecordMock).toHaveBeenCalledWith("r1", {
      denyCode: "PR-1",
      actorUserId: "u1",
    });
    await waitFor(() => {
      expect(onRecordUpdated).toHaveBeenCalledWith(updatedRecord);
    });
    expect(
      screen.getByRole("combobox", { name: "Deny code" }),
    ).toHaveValue("PR-1");
  });

  it("sends null when the denial code is cleared", async () => {
    const user = userEvent.setup();
    const updatedRecord = {
      ...sampleRecords[0],
      denyCode: null,
      whoChanged: "u1",
      dateChanged: "2026-08-26T12:00:00.000Z",
    };
    updateRecordMock.mockResolvedValue(updatedRecord);
    const { onRecordUpdated } = renderDetailPanel(sampleRecords[0]);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Deny code" }),
      "",
    );

    expect(updateRecordMock).toHaveBeenCalledWith("r1", {
      denyCode: null,
      actorUserId: "u1",
    });
    await waitFor(() => {
      expect(onRecordUpdated).toHaveBeenCalledWith(updatedRecord);
    });
  });

  it("restores the previous denial code when saving fails", async () => {
    const user = userEvent.setup();
    updateRecordMock.mockRejectedValue(
      new Error("Unable to update record (503)."),
    );
    const { onRecordUpdated } = renderDetailPanel(sampleRecords[0]);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Deny code" }),
      "PR-1",
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Unable to update record (503).");
    expect(
      screen.getByRole("combobox", { name: "Deny code" }),
    ).toHaveValue("CO-45");
    expect(onRecordUpdated).not.toHaveBeenCalled();
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

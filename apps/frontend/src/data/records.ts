// src/data/records.ts

export type DemoRecord = {
  id: string;                 // system, primary key — not editable
  patientNumber: string;      // locked — identifies the claim
  dos: string;                // locked — date-only, MM/DD/YYYY, kept as a string
  payer: string;              // locked (claim identity)
  comment: string;            // editable, commit-on-blur
  denyCode: string | null;    // editable; null when the row isn't denied
  done: boolean;              // editable (immediate)
  whoChanged: string;         // system-set, display-locked
  dateChanged: string;        // system-set, display-locked (display string)
};

export const sampleRecords: DemoRecord[] = [
  {
    id: "r1",
    patientNumber: "P-0049217",
    dos: "03/14/2026",
    payer: "Blue Ridge Mutual",
    comment: "Resubmitted with corrected modifier; awaiting payer response.",
    denyCode: "CO-45",
    done: false,
    whoChanged: "m.reyes",
    dateChanged: "03/18/2026 2:41 PM",
  },
  {
    id: "r2",
    patientNumber: "P-0051880",
    dos: "03/09/2026",
    payer: "Summit Health Plan",
    comment: "Deductible applied; patient billed.",
    denyCode: "PR-1",
    done: true,
    whoChanged: "d.whitfield",
    dateChanged: "03/11/2026 9:02 AM",
  },
  {
    id: "r3",
    patientNumber: "P-0048003",
    dos: "02/27/2026",
    payer: "Blue Ridge Mutual",
    comment: "Bundled service — under review.",
    denyCode: "CO-97",
    done: false,
    whoChanged: "m.reyes",
    dateChanged: "03/02/2026 4:15 PM",
  },
  {
    id: "r4",
    patientNumber: "P-0052419",
    dos: "02/20/2026",
    payer: "Summit Health Plan",
    comment: "Paid in full.",
    denyCode: null,
    done: true,
    whoChanged: "p.anand",
    dateChanged: "02/22/2026 11:30 AM",
  },
];
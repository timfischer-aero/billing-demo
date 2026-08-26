export type BillingRecord = {
  id: string;
  patientNumber: string;
  dos: string;
  payer: string;
  comment: string;
  denyCode: string | null;
  done: boolean;
  whoChanged: string;
  dateChanged: string;
};

export type EditableRecordChanges = {
  comment?: string;
  denyCode?: string | null;
  done?: boolean;
};
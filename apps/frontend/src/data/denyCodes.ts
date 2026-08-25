export type TermDefinition = {
  term: string;
  definition: string;
};

const denyCodeDefinitions: Record<string, TermDefinition> = {
  "CO-45": {
    term: "CO-45",
    definition:
      "Charge exceeds the fee schedule, maximum allowable amount, or the " +
      "contracted/legislated fee arrangement. The amount billed is above what " +
      "the payer's contract permits for this service. The excess is a " +
      "contractual adjustment and is not billable to the patient. No further " +
      "action is typically required beyond writing off the difference.",
  },
  "PR-1": {
    term: "PR-1",
    definition:
      "The amount applied to the patient's deductible. The patient has not yet " +
      "met their plan deductible for the benefit period, so this portion of the " +
      "charge is the patient's responsibility. Bill the patient for the " +
      "indicated amount. This is a patient-responsibility code, not a denial.",
  },
  "CO-97": {
    term: "CO-97",
    definition:
      "The benefit for this service is included in the payment or allowance for " +
      "another service that has already been adjudicated. This is a bundling " +
      "adjustment—the payer considers the service part of a broader procedure. " +
      "Review the primary procedure code to confirm correct bundling. If the " +
      "service was distinct, a corrected claim with an appropriate modifier may " +
      "be warranted.",
  },
};

export function getDefinition(code: string): TermDefinition | null {
  return denyCodeDefinitions[code] ?? null;
}
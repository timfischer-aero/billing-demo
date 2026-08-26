-- Fictional demonstration data only. No row represents a real patient or claim.
-- Denial-code text is a concise demo summary and is not billing guidance.

BEGIN;

INSERT INTO deny_code_definitions (term, definition)
VALUES
  (
    'CO-45',
    $$Charge exceeds the fee schedule, maximum allowable amount, or the contracted or legislated fee arrangement. The amount billed is above what the payer contract permits for this service. The excess is generally treated as a contractual adjustment rather than patient responsibility. Review the contract and allowed amount before posting the adjustment.$$
  ),
  (
    'PR-1',
    $$The amount was applied to the patient's deductible. The patient has not yet met the plan deductible for the benefit period, so this portion is assigned to patient responsibility. Confirm the amount against the remittance advice before billing the patient.$$
  ),
  (
    'CO-97',
    $$The benefit for this service is included in the payment or allowance for another service that has already been adjudicated. The payer considers the service part of a broader procedure. Review the primary procedure and applicable modifiers when determining whether the bundling is correct.$$
  ),
  (
    'CO-4',
    $$The procedure code is inconsistent with the modifier used, or a required modifier is missing. Review the billed procedure, modifier combination, and payer rules. A corrected claim may be appropriate when the submitted coding was incomplete or inconsistent.$$
  ),
  (
    'CO-16',
    $$The claim or service lacks information needed for adjudication or contains a submission error. The accompanying remittance remark code normally identifies the missing or invalid information. Review the claim and remark codes before correcting and resubmitting it.$$
  ),
  (
    'OA-18',
    $$The payer identified an exact duplicate claim or service. Confirm whether the earlier claim was accepted and processed before taking action. If the submission was not actually a duplicate, compare claim identifiers, dates, procedures, and replacement-claim indicators.$$
  ),
  (
    'CO-22',
    $$The service may be covered by another payer under coordination-of-benefits rules. Verify the patient's coverage order and whether primary-payer information was included. The claim may need to be submitted to another payer first or resubmitted with the prior payer's adjudication details.$$
  ),
  (
    'CO-29',
    $$The payer reports that the filing time limit has expired. Compare the service and submission dates with the payer's timely-filing rules. If the claim was originally submitted on time, supporting proof of timely filing may be needed.$$
  ),
  (
    'CO-50',
    $$The payer considers the service non-covered because it was not deemed medically necessary. Review the applicable coverage policy, diagnosis information, and supporting documentation. Any appeal or correction should be based on the payer's stated policy and remittance details.$$
  ),
  (
    'CO-96',
    $$The payer classified the charge as non-covered. The accompanying remittance remark or policy information should explain the specific coverage reason. Review that additional information before deciding whether to correct, appeal, adjust, or bill another responsible party.$$
  ),
  (
    'CO-109',
    $$The claim or service is not covered by this payer or contractor and should be sent to the correct payer. Confirm the patient's active coverage and payer routing information for the date of service. Correct the payer selection before resubmission.$$
  ),
  (
    'CO-167',
    $$The payer reports that the submitted diagnosis is not covered for the service. Review the coverage policy and confirm that the diagnosis coding accurately reflects the documentation. Use the remittance policy information when evaluating a correction or appeal.$$
  ),
  (
    'PR-2',
    $$The amount was assigned to patient coinsurance. Coinsurance is the patient's percentage share of the allowed amount after applicable plan rules are applied. Confirm the amount against the remittance advice before billing the patient.$$
  )
ON CONFLICT (term) DO UPDATE
SET definition = EXCLUDED.definition;

INSERT INTO billing_records (
  id,
  patient_number,
  dos,
  payer,
  comment,
  deny_code,
  done,
  who_changed,
  date_changed
)
VALUES
  (
    'r1', 'P-0049217', '03/14/2026', 'Blue Ridge Mutual',
    'Resubmitted with corrected modifier; awaiting payer response.',
    'CO-45', false, '', ''
  ),
  (
    'r2', 'P-0051880', '03/09/2026', 'Summit Health Plan',
    'Deductible applied; patient statement pending.',
    'PR-1', true, '', ''
  ),
  (
    'r3', 'P-0048003', '02/27/2026', 'Blue Ridge Mutual',
    'Bundled service is under coding review.',
    'CO-97', false, '', ''
  ),
  (
    'r4', 'P-0052419', '02/20/2026', 'Summit Health Plan',
    'Paid in full with no denial adjustment.',
    NULL, true, '', ''
  ),
  (
    'r5', 'P-0053074', '03/18/2026', 'HarborPoint Insurance',
    'Modifier combination sent to coding for review.',
    'CO-4', false, '', ''
  ),
  (
    'r6', 'P-0053191', '03/17/2026', 'Northstar Benefit Group',
    'Payer requested additional claim information.',
    'CO-16', false, '', ''
  ),
  (
    'r7', 'P-0053228', '03/16/2026', 'Blue Ridge Mutual',
    'Possible duplicate; checking the original submission.',
    'OA-18', false, '', ''
  ),
  (
    'r8', 'P-0053302', '03/15/2026', 'Green Valley Administrators',
    'Coordination-of-benefits questionnaire requested.',
    'CO-22', false, '', ''
  ),
  (
    'r9', 'P-0053416', '03/12/2026', 'HarborPoint Insurance',
    'Researching proof of timely filing.',
    'CO-29', false, '', ''
  ),
  (
    'r10', 'P-0053499', '03/10/2026', 'Summit Health Plan',
    'Medical-necessity documentation is under review.',
    'CO-50', false, '', ''
  ),
  (
    'r11', 'P-0053560', '03/08/2026', 'Northstar Benefit Group',
    'Reviewing payer policy and remittance remark codes.',
    'CO-96', false, '', ''
  ),
  (
    'r12', 'P-0053614', '03/06/2026', 'Green Valley Administrators',
    'Coverage indicates a different payer may be responsible.',
    'CO-109', false, '', ''
  ),
  (
    'r13', 'P-0053721', '03/04/2026', 'Blue Ridge Mutual',
    'Diagnosis-to-service coverage review is pending.',
    'CO-167', false, '', ''
  ),
  (
    'r14', 'P-0053805', '03/02/2026', 'HarborPoint Insurance',
    'Coinsurance amount confirmed on remittance.',
    'PR-2', true, '', ''
  ),
  (
    'r15', 'P-0053912', '02/28/2026', 'Northstar Benefit Group',
    'Corrected claim submitted with required modifier.',
    'CO-4', true, '', ''
  ),
  (
    'r16', 'P-0054027', '02/25/2026', 'Summit Health Plan',
    'Missing subscriber information has been corrected.',
    'CO-16', true, '', ''
  ),
  (
    'r17', 'P-0054188', '02/23/2026', 'Green Valley Administrators',
    'Primary payer response attached to resubmission.',
    'CO-22', true, '', ''
  ),
  (
    'r18', 'P-0054263', '02/18/2026', 'Blue Ridge Mutual',
    'No denial reported; routine payment review complete.',
    NULL, true, '', ''
  ),
  (
    'r19', 'P-0054379', '02/15/2026', 'HarborPoint Insurance',
    'Appeal packet is being assembled for review.',
    'CO-50', false, '', ''
  ),
  (
    'r20', 'P-0054490', '02/12/2026', 'Northstar Benefit Group',
    'Correct payer identified; claim is ready to resubmit.',
    'CO-109', true, '', ''
  )
ON CONFLICT (id) DO UPDATE
SET
  patient_number = EXCLUDED.patient_number,
  dos = EXCLUDED.dos,
  payer = EXCLUDED.payer,
  comment = EXCLUDED.comment,
  deny_code = EXCLUDED.deny_code,
  done = EXCLUDED.done,
  who_changed = EXCLUDED.who_changed,
  date_changed = EXCLUDED.date_changed;

COMMIT;

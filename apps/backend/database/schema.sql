BEGIN;

DROP TABLE IF EXISTS billing_records;
DROP TABLE IF EXISTS deny_code_definitions;

CREATE TABLE deny_code_definitions (
  term text PRIMARY KEY,
  definition text NOT NULL
);

CREATE TABLE billing_records (
  id text PRIMARY KEY,
  patient_number text NOT NULL,
  dos text NOT NULL,
  payer text NOT NULL,
  comment varchar(255) NOT NULL,
  deny_code text REFERENCES deny_code_definitions(term),
  done boolean NOT NULL,
  who_changed text NOT NULL,
  date_changed text NOT NULL
);

COMMIT;
import { BadRequestException, Injectable } from '@nestjs/common';
import type { QueryResultRow } from 'pg';
import { DatabaseService } from '../database/database.service';
import type {
  BillingRecord,
  EditableRecordChanges,
} from './record.type';

type BillingRecordRow = BillingRecord & QueryResultRow;

@Injectable()
export class RecordsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<BillingRecord[]> {
    const result = await this.databaseService.query<BillingRecordRow>(`
      SELECT
        id,
        patient_number AS "patientNumber",
        dos,
        payer,
        comment,
        deny_code AS "denyCode",
        done,
        who_changed AS "whoChanged",
        date_changed AS "dateChanged"
      FROM billing_records
      ORDER BY id
    `);

    return result.rows.map((record) => ({ ...record }));
  }

  async update(
    id: string,
    changes: EditableRecordChanges,
    actorUserId: string,
  ): Promise<BillingRecord | null> {
    if (changes.denyCode !== undefined && changes.denyCode !== null) {
      const definitionResult =
        await this.databaseService.query<QueryResultRow>(
          `
            SELECT term
            FROM deny_code_definitions
            WHERE term = $1
          `,
          [changes.denyCode],
        );

      if (definitionResult.rows.length === 0) {
        throw new BadRequestException(
          `Unknown denial code: ${changes.denyCode}.`,
        );
      }
    }

    const assignments: string[] = [];
    const values: unknown[] = [];

    if (changes.comment !== undefined) {
      values.push(changes.comment);
      assignments.push(`comment = $${values.length}`);
    }

    if (changes.denyCode !== undefined) {
      values.push(changes.denyCode);
      assignments.push(`deny_code = $${values.length}`);
    }

    if (changes.done !== undefined) {
      values.push(changes.done);
      assignments.push(`done = $${values.length}`);
    }

    if (assignments.length === 0) {
      throw new BadRequestException(
        'At least one editable field must be provided.',
      );
    }

    values.push(actorUserId);
    assignments.push(`who_changed = $${values.length}`);

    values.push(new Date().toISOString());
    assignments.push(`date_changed = $${values.length}`);

    values.push(id);
    const idParameter = `$${values.length}`;

    const result = await this.databaseService.query<BillingRecordRow>(
      `
        UPDATE billing_records
        SET ${assignments.join(', ')}
        WHERE id = ${idParameter}
        RETURNING
          id,
          patient_number AS "patientNumber",
          dos,
          payer,
          comment,
          deny_code AS "denyCode",
          done,
          who_changed AS "whoChanged",
          date_changed AS "dateChanged"
      `,
      values,
    );

    const updatedRecord = result.rows[0];

    return updatedRecord ? { ...updatedRecord } : null;
  }
}

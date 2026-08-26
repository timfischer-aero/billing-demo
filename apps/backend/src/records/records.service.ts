import { Injectable } from '@nestjs/common';
import type { QueryResultRow } from 'pg';
import { DatabaseService } from '../database/database.service';
import type { BillingRecord } from './record.type';

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
}

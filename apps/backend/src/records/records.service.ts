import { Injectable } from '@nestjs/common';
import type { BillingRecord } from './record.type';
import { initialRecords } from './records.data';

@Injectable()
export class RecordsService {
  private readonly records: BillingRecord[] = initialRecords.map((record) => ({
    ...record,
  }));

  findAll(): BillingRecord[] {
    return this.records.map((record) => ({ ...record }));
  }
}

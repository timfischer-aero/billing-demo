import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import type { BillingRecord } from './record.type';
import { RecordsService } from './records.service';

describe('RecordsService', () => {
  let service: RecordsService;
  let queryMock: jest.Mock;

  beforeEach(async () => {
    queryMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsService,
        {
          provide: DatabaseService,
          useValue: { query: queryMock },
        },
      ],
    }).compile();

    service = module.get<RecordsService>(RecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns records from the database', async () => {
    const storedRecords: BillingRecord[] = [
      {
        id: 'r1',
        patientNumber: 'P-0049217',
        dos: '03/14/2026',
        payer: 'Blue Ridge Mutual',
        comment: 'Test comment',
        denyCode: 'CO-45',
        done: false,
        whoChanged: '',
        dateChanged: '',
      },
    ];

    queryMock.mockResolvedValue({ rows: storedRecords });

    await expect(service.findAll()).resolves.toEqual(storedRecords);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('FROM billing_records'),
    );
  });

  it('preserves the camelCase API aliases in the query', async () => {
    queryMock.mockResolvedValue({ rows: [] });

    await service.findAll();

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('patient_number AS "patientNumber"'),
    );
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('deny_code AS "denyCode"'),
    );
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('who_changed AS "whoChanged"'),
    );
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('date_changed AS "dateChanged"'),
    );
  });

  it('returns copies instead of exposing database rows', async () => {
    const storedRecord: BillingRecord = {
      id: 'r2',
      patientNumber: 'P-0051880',
      dos: '03/09/2026',
      payer: 'Summit Health Plan',
      comment: 'Test comment',
      denyCode: 'PR-1',
      done: true,
      whoChanged: '',
      dateChanged: '',
    };

    queryMock.mockResolvedValue({ rows: [storedRecord] });

    const records = await service.findAll();

    expect(records[0]).toEqual(storedRecord);
    expect(records[0]).not.toBe(storedRecord);
  });
});

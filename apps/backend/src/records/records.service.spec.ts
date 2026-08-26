import { BadRequestException } from '@nestjs/common';
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

  it('updates a comment with parameterized values and audit fields', async () => {
    const updatedRecord: BillingRecord = {
      id: 'r1',
      patientNumber: 'P-0049217',
      dos: '03/14/2026',
      payer: 'Blue Ridge Mutual',
      comment: 'Corrected claim submitted.',
      denyCode: 'CO-45',
      done: false,
      whoChanged: 'user-1',
      dateChanged: '2026-08-25T12:00:00.000Z',
    };
    queryMock.mockResolvedValue({ rows: [updatedRecord] });

    const result = await service.update(
      'r1',
      { comment: 'Corrected claim submitted.' },
      'user-1',
    );

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining(
        'SET comment = $1, who_changed = $2, date_changed = $3',
      ),
      [
        'Corrected claim submitted.',
        'user-1',
        expect.any(String),
        'r1',
      ],
    );
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('WHERE id = $4'),
      expect.any(Array),
    );
    expect(result).toEqual(updatedRecord);
    expect(result).not.toBe(updatedRecord);
  });

  it('preserves false when updating the done field', async () => {
    queryMock.mockResolvedValue({ rows: [] });

    await service.update('r1', { done: false }, 'user-1');

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('done = $1'),
      [false, 'user-1', expect.any(String), 'r1'],
    );
  });

  it('allows the denial code to be cleared with null', async () => {
    queryMock.mockResolvedValue({ rows: [] });

    await service.update('r1', { denyCode: null }, 'user-1');

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('deny_code = $1'),
      [null, 'user-1', expect.any(String), 'r1'],
    );
  });

  it('checks that a supplied denial code exists before updating', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ term: 'CO-97' }] })
      .mockResolvedValueOnce({ rows: [] });

    await service.update('r1', { denyCode: 'CO-97' }, 'user-1');

    expect(queryMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('FROM deny_code_definitions'),
      ['CO-97'],
    );
    expect(queryMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('deny_code = $1'),
      ['CO-97', 'user-1', expect.any(String), 'r1'],
    );
  });

  it('rejects an unknown denial code without updating the record', async () => {
    queryMock.mockResolvedValue({ rows: [] });

    await expect(
      service.update('r1', { denyCode: 'UNKNOWN' }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('FROM deny_code_definitions'),
      ['UNKNOWN'],
    );
  });

  it('rejects an update without editable fields', async () => {
    await expect(service.update('r1', {}, 'user-1')).rejects.toThrow(
      BadRequestException,
    );
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('returns null when the record ID does not exist', async () => {
    queryMock.mockResolvedValue({ rows: [] });

    await expect(
      service.update('missing', { comment: 'Update' }, 'user-1'),
    ).resolves.toBeNull();
  });
});

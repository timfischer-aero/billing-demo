import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { BillingRecord } from './record.type';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';

describe('RecordsController', () => {
  let controller: RecordsController;
  let findAllMock: jest.Mock;
  let updateMock: jest.Mock;

  beforeEach(async () => {
    findAllMock = jest.fn();
    updateMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordsController],
      providers: [
        {
          provide: RecordsService,
          useValue: {
            findAll: findAllMock,
            update: updateMock,
          },
        },
      ],
    }).compile();

    controller = module.get<RecordsController>(RecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns all records from the service', async () => {
    const records: BillingRecord[] = [
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

    findAllMock.mockResolvedValue(records);

    await expect(controller.findAll()).resolves.toEqual(records);
    expect(findAllMock).toHaveBeenCalledTimes(1);
  });

  it('passes editable fields and the actor to the update service', async () => {
    const updatedRecord: BillingRecord = {
      id: 'r1',
      patientNumber: 'P-0049217',
      dos: '03/14/2026',
      payer: 'Blue Ridge Mutual',
      comment: 'Updated comment',
      denyCode: null,
      done: false,
      whoChanged: 'user-1',
      dateChanged: '2026-08-25T12:00:00.000Z',
    };
    updateMock.mockResolvedValue(updatedRecord);

    await expect(
      controller.update('r1', {
        actorUserId: 'user-1',
        comment: 'Updated comment',
        denyCode: null,
        done: false,
      }),
    ).resolves.toEqual(updatedRecord);

    expect(updateMock).toHaveBeenCalledWith(
      'r1',
      {
        comment: 'Updated comment',
        denyCode: null,
        done: false,
      },
      'user-1',
    );
  });

  it('does not add omitted editable fields to the service request', async () => {
    const updatedRecord: BillingRecord = {
      id: 'r1',
      patientNumber: 'P-0049217',
      dos: '03/14/2026',
      payer: 'Blue Ridge Mutual',
      comment: 'Existing comment',
      denyCode: 'CO-45',
      done: false,
      whoChanged: 'user-2',
      dateChanged: '2026-08-25T12:00:00.000Z',
    };
    updateMock.mockResolvedValue(updatedRecord);

    await controller.update('r1', {
      actorUserId: 'user-2',
      done: false,
    });

    expect(updateMock).toHaveBeenCalledWith(
      'r1',
      { done: false },
      'user-2',
    );
  });

  it('throws a not-found exception when the record does not exist', async () => {
    updateMock.mockResolvedValue(null);

    await expect(
      controller.update('missing', {
        actorUserId: 'user-1',
        comment: 'Updated comment',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});

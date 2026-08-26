import { Test, TestingModule } from '@nestjs/testing';
import type { BillingRecord } from './record.type';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';

describe('RecordsController', () => {
  let controller: RecordsController;
  let findAllMock: jest.Mock;

  beforeEach(async () => {
    findAllMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordsController],
      providers: [
        {
          provide: RecordsService,
          useValue: { findAll: findAllMock },
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
});

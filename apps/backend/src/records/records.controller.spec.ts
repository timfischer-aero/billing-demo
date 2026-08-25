import { Test, TestingModule } from '@nestjs/testing';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';

describe('RecordsController', () => {
  let controller: RecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordsController],
      providers: [RecordsService],
    }).compile();

    controller = module.get<RecordsController>(RecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns all records from the service', () => {
    expect(controller.findAll()).toHaveLength(4);
  });
});

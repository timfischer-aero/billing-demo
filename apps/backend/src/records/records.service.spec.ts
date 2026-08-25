import { Test, TestingModule } from '@nestjs/testing';
import { RecordsService } from './records.service';

describe('RecordsService', () => {
  let service: RecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecordsService],
    }).compile();

    service = module.get<RecordsService>(RecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("returns all initial records", () => {
    const records = service.findAll();

    expect(records).toHaveLength(4);
    expect(records.map((record) => record.id)).toEqual([
      "r1",
      "r2",
      "r3",
      "r4",
    ]);
  });

});

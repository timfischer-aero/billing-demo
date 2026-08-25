import { Test, TestingModule } from '@nestjs/testing';
import { DefinitionsService } from './definitions.service';

describe('DefinitionsService', () => {
  let service: DefinitionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DefinitionsService],
    }).compile();

    service = module.get<DefinitionsService>(DefinitionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each(['CO-45', 'PR-1', 'CO-97'])(
    'returns the definition for %s',
    (term) => {
      const result = service.findOne(term);

      expect(result).not.toBeNull();
      expect(result?.term).toBe(term);
      expect(result?.definition.length).toBeGreaterThan(0);
    },
  );

  it('returns null when the term is unknown', () => {
    expect(service.findOne('UNKNOWN')).toBeNull();
  });

  it('returns a copy instead of exposing stored data', () => {
    const firstResult = service.findOne('CO-45');
    const secondResult = service.findOne('CO-45');

    expect(firstResult).toEqual(secondResult);
    expect(firstResult).not.toBe(secondResult);
  });



});

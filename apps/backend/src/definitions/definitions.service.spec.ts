import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import { DefinitionsService } from './definitions.service';

describe('DefinitionsService', () => {
  let service: DefinitionsService;
  let queryMock: jest.Mock;

  beforeEach(async () => {
    queryMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DefinitionsService,
        {
          provide: DatabaseService,
          useValue: {
            query: queryMock,
          },
        },
      ],
    }).compile();

    service = module.get<DefinitionsService>(DefinitionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns all definitions ordered by term', async () => {
    const storedDefinitions = [
      { term: 'CO-45', definition: 'First test definition' },
      { term: 'PR-1', definition: 'Second test definition' },
    ];

    queryMock.mockResolvedValue({ rows: storedDefinitions });

    await expect(service.findAll()).resolves.toEqual(storedDefinitions);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY term'),
    );
  });

  it('returns copies of definition rows from findAll', async () => {
    const storedDefinition = {
      term: 'CO-45',
      definition: 'Test definition',
    };

    queryMock.mockResolvedValue({ rows: [storedDefinition] });

    const definitions = await service.findAll();

    expect(definitions[0]).toEqual(storedDefinition);
    expect(definitions[0]).not.toBe(storedDefinition);
  });

  it('queries for the requested term', async () => {
    const storedDefinition = {
      term: 'CO-45',
      definition: 'Test definition',
    };

    queryMock.mockResolvedValue({
      rows: [storedDefinition],
    });

    await expect(service.findOne('CO-45')).resolves.toEqual(storedDefinition);

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('WHERE term = $1'),
      ['CO-45'],
    );
  });

  it('returns null when no row is found', async () => {
    queryMock.mockResolvedValue({
      rows: [],
    });

    await expect(service.findOne('UNKNOWN')).resolves.toBeNull();
  });

  it('returns a copy of the database row', async () => {
    const storedDefinition = {
      term: 'PR-1',
      definition: 'Test definition',
    };

    queryMock.mockResolvedValue({
      rows: [storedDefinition],
    });

    const result = await service.findOne('PR-1');

    expect(result).toEqual(storedDefinition);
    expect(result).not.toBe(storedDefinition);
  });
});

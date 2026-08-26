import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DefinitionsController } from './definitions.controller';
import { DefinitionsService } from './definitions.service';

describe('DefinitionsController', () => {
  let controller: DefinitionsController;
  let findAllMock: jest.Mock;
  let findOneMock: jest.Mock;

  beforeEach(async () => {
    findAllMock = jest.fn();
    findOneMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DefinitionsController],
      providers: [
        {
          provide: DefinitionsService,
          useValue: {
            findAll: findAllMock,
            findOne: findOneMock,
          },
        },
      ],
    }).compile();

    controller = module.get<DefinitionsController>(DefinitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns all definitions', async () => {
    const definitions = [
      { term: 'CO-45', definition: 'First test definition' },
      { term: 'PR-1', definition: 'Second test definition' },
    ];

    findAllMock.mockResolvedValue(definitions);

    await expect(controller.findAll()).resolves.toEqual(definitions);
    expect(findAllMock).toHaveBeenCalledTimes(1);
  });

  it('returns a known definition', async () => {
    const definition = {
      term: 'CO-45',
      definition: 'Test definition',
    };

    findOneMock.mockResolvedValue(definition);

    await expect(controller.findOne('CO-45')).resolves.toEqual(definition);

    expect(findOneMock).toHaveBeenCalledWith('CO-45');
  });

  it('throws NotFoundException for an unknown term', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(controller.findOne('UNKNOWN')).rejects.toThrow(
      NotFoundException,
    );
  });
});

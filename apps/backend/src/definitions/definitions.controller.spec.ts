import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DefinitionsController } from './definitions.controller';
import { DefinitionsService } from './definitions.service';

describe('DefinitionsController', () => {
  let controller: DefinitionsController;
  let findOneMock: jest.Mock;

  beforeEach(async () => {
    findOneMock = jest.fn();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [DefinitionsController],
        providers: [
          {
            provide: DefinitionsService,
            useValue: {
              findOne: findOneMock,
            },
          },
        ],
      }).compile();

    controller =
      module.get<DefinitionsController>(
        DefinitionsController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns a known definition', async () => {
    const definition = {
      term: 'CO-45',
      definition: 'Test definition',
    };

    findOneMock.mockResolvedValue(definition);

    await expect(
      controller.findOne('CO-45'),
    ).resolves.toEqual(definition);

    expect(findOneMock).toHaveBeenCalledWith('CO-45');
  });

  it('throws NotFoundException for an unknown term', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(
      controller.findOne('UNKNOWN'),
    ).rejects.toThrow(NotFoundException);
  });
});
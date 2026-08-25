import { Test, TestingModule } from '@nestjs/testing';
import { DefinitionsController } from './definitions.controller';
import { DefinitionsService } from './definitions.service';
import { NotFoundException } from '@nestjs/common';

describe('DefinitionsController', () => {
  let controller: DefinitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DefinitionsController],
      providers: [DefinitionsService],
    }).compile();

    controller = module.get<DefinitionsController>(DefinitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns a known definition', () => {
    expect(controller.findOne('CO-45')).toEqual(
      expect.objectContaining({
        term: 'CO-45',
        definition: expect.any(String),
      }),
    );
  });

  it('throws NotFoundException for an unknown term', () => {
    expect(() => controller.findOne('UNKNOWN')).toThrow(
      NotFoundException,
    );
  });

});

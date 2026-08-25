import {
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { DefinitionsService } from './definitions.service';
import type { TermDefinition } from './term-definition.type';

@Controller('definitions')
export class DefinitionsController {
  constructor(
    private readonly definitionsService: DefinitionsService,
  ) {}

  @Get(':term')
  findOne(@Param('term') term: string): TermDefinition {
    const definition = this.definitionsService.findOne(term);

    if (definition === null) {
      throw new NotFoundException(
        `No definition available for ${term}.`,
      );
    }

    return definition;
  }
}
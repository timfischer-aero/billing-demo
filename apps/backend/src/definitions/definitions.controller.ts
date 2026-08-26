import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { DefinitionsService } from './definitions.service';
import type { TermDefinition } from './term-definition.type';

@Controller('definitions')
export class DefinitionsController {
  constructor(private readonly definitionsService: DefinitionsService) {}

  @Get(':term')
  async findOne(@Param('term') term: string): Promise<TermDefinition> {
    const definition = await this.definitionsService.findOne(term);

    if (definition === null) {
      throw new NotFoundException(`No definition available for ${term}.`);
    }

    return definition;
  }
}

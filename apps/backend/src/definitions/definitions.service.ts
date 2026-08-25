import { Injectable } from '@nestjs/common';
import { initialDefinitions } from './definitions.data';
import type { TermDefinition } from './term-definition.type';

@Injectable()
export class DefinitionsService {
  findOne(term: string): TermDefinition | null {
    const result = initialDefinitions[term];

    return result ? { ...result } : null;
  }
}
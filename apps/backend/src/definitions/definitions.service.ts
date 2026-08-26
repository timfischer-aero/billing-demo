import { Injectable } from '@nestjs/common';
import type { QueryResultRow } from 'pg';
import { DatabaseService } from '../database/database.service';
import type { TermDefinition } from './term-definition.type';

type TermDefinitionRow = TermDefinition & QueryResultRow;

@Injectable()
export class DefinitionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<TermDefinition[]> {
    const result = await this.databaseService.query<TermDefinitionRow>(`
      SELECT term, definition
      FROM deny_code_definitions
      ORDER BY term
    `);

    return result.rows.map((definition) => ({ ...definition }));
  }

  async findOne(term: string): Promise<TermDefinition | null> {
    const result = await this.databaseService.query<TermDefinitionRow>(
      `
        SELECT term, definition
        FROM deny_code_definitions
        WHERE term = $1
      `,
      [term],
    );

    const definition = result.rows[0];

    return definition ? { ...definition } : null;
  }
}

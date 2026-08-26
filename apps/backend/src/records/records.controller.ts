import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordsService } from './records.service';
import type {
  BillingRecord,
  EditableRecordChanges,
} from './record.type';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  async findAll(): Promise<BillingRecord[]> {
    return this.recordsService.findAll();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() request: UpdateRecordDto,
  ): Promise<BillingRecord> {
    const changes: EditableRecordChanges = {};

    if (request.comment !== undefined) {
      changes.comment = request.comment;
    }

    if (request.denyCode !== undefined) {
      changes.denyCode = request.denyCode;
    }

    if (request.done !== undefined) {
      changes.done = request.done;
    }

    const updatedRecord = await this.recordsService.update(
      id,
      changes,
      request.actorUserId,
    );

    if (updatedRecord === null) {
      throw new NotFoundException(`Record ${id} was not found.`);
    }

    return updatedRecord;
  }
}

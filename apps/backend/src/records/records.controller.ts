import { Controller, Get } from "@nestjs/common";
import { RecordsService } from "./records.service";
import type { BillingRecord } from "./record.type";

@Controller("records")
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  findAll(): BillingRecord[] {
    return this.recordsService.findAll();
  }
}
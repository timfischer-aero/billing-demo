import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecordsModule } from './records/records.module';
import { DefinitionsModule } from './definitions/definitions.module';

@Module({
  imports: [RecordsModule, DefinitionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

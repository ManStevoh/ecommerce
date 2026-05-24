import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TrialsController } from './trials.controller';
import { TrialsService } from './trials.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TrialsController],
  providers: [TrialsService],
})
export class TrialsModule {}

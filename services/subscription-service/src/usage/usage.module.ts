import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UsageController } from './usage.controller';
import { UsageService } from './usage.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UsageController],
  providers: [UsageService],
})
export class UsageModule {}

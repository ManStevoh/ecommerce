import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FraudController } from './fraud.controller';
import { FraudService } from './fraud.service';

@Module({
  imports: [DatabaseModule],
  controllers: [FraudController],
  providers: [FraudService],
})
export class FraudModule {}

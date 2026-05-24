import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FulfillmentController } from './fulfillment.controller';
import { FulfillmentService } from './fulfillment.service';

@Module({
  imports: [DatabaseModule],
  controllers: [FulfillmentController],
  providers: [FulfillmentService],
})
export class FulfillmentModule {}

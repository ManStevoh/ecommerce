import { Module } from '@nestjs/common';
import { PlansModule } from '../plans/plans.module';
import { TrialsController } from './trials.controller';
import { TrialsService } from './trials.service';

@Module({
  imports: [PlansModule],
  controllers: [TrialsController],
  providers: [TrialsService],
  exports: [TrialsService],
})
export class TrialsModule {}

import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { Public } from '../common/tenant/public.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(dto);
  }

  @Get('platform/stats')
  @Public()
  platformStats() {
    return this.subscriptionsService.getPlatformStats();
  }

  @Get('platform')
  @Public()
  findAllPlatform() {
    return this.subscriptionsService.findAllPlatform();
  }

  @Get('current')
  findCurrent() {
    return this.subscriptionsService.findCurrent();
  }

  @Delete('current')
  cancel() {
    return this.subscriptionsService.cancel();
  }
}

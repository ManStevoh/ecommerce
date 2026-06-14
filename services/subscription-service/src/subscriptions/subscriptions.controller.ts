import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { Public } from '../common/tenant/public.decorator';
import { PlatformAdminGuard } from '../common/guards/platform-admin.guard';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(dto);
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Get('platform/stats')
  platformStats() {
    return this.subscriptionsService.getPlatformStats();
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Get('platform')
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

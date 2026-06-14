import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BillingCycle, SubscriptionPlan } from '@nexora/shared-types';
import { Public } from '../common/tenant/public.decorator';
import { PlatformAdminGuard } from '../common/guards/platform-admin.guard';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Public()
  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Get('admin/all')
  findAllAdmin() {
    return this.plansService.findAll(true);
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Post('admin')
  create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Delete('admin/:id')
  deactivate(@Param('id') id: string) {
    return this.plansService.deactivate(id);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.plansService.findBySlug(slug);
  }

  @Public()
  @Get(':plan/pricing')
  getPricing(
    @Param('plan') plan: SubscriptionPlan,
    @Query('cycle') cycle: BillingCycle = BillingCycle.MONTHLY,
  ) {
    return this.plansService.getPricing(plan, cycle);
  }

  @Public()
  @Get(':plan')
  findOne(@Param('plan') plan: SubscriptionPlan) {
    return this.plansService.findOne(plan);
  }
}

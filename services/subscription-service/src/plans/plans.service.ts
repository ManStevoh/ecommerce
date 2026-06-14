import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@nexora/database';
import { BillingCycle, SubscriptionPlan } from '@nexora/shared-types';
import { PrismaService } from '../database/prisma.service';
import { PlanResolverService } from './plan-resolver.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planResolver: PlanResolverService,
  ) {}

  private mapPlan(record: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    priceMonthly: Prisma.Decimal;
    priceYearly: Prisma.Decimal;
    currency: string;
    maxProducts: number;
    maxUsers: number;
    maxStorageMb: number;
    features: unknown;
    isActive: boolean;
  }) {
    return {
      id: record.id,
      slug: record.slug,
      name: record.name,
      description: record.description,
      priceMonthly: Number(record.priceMonthly),
      priceYearly: Number(record.priceYearly),
      currency: record.currency,
      maxProducts: record.maxProducts,
      maxUsers: record.maxUsers,
      maxStorageMb: record.maxStorageMb,
      features: Array.isArray(record.features) ? record.features : [],
      isActive: record.isActive,
    };
  }

  async findAll(includeInactive = false) {
    await this.planResolver.ensureCatalogPlans();
    const plans = await this.prisma.plan.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });
    return plans.map((p) => this.mapPlan(p));
  }

  async findOne(plan: SubscriptionPlan) {
    const record = await this.planResolver.resolveByPlanEnum(plan);
    return this.mapPlan(record);
  }

  async findBySlug(slug: string) {
    const record = await this.planResolver.resolveBySlug(slug);
    return this.mapPlan(record);
  }

  async getPricing(plan: SubscriptionPlan, cycle: BillingCycle) {
    const record = await this.findOne(plan);
    return {
      plan,
      cycle,
      amountUsd:
        cycle === BillingCycle.YEARLY ? record.priceYearly : record.priceMonthly,
      definition: record,
    };
  }

  async create(dto: CreatePlanDto) {
    const slug = dto.slug.trim().toLowerCase();
    const existing = await this.prisma.plan.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Plan slug ${slug} already exists`);
    }

    const record = await this.prisma.plan.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        priceMonthly: dto.priceMonthly,
        priceYearly: dto.priceYearly,
        currency: dto.currency ?? 'USD',
        maxProducts: dto.maxProducts ?? 100,
        maxUsers: dto.maxUsers ?? 10,
        maxStorageMb: dto.maxStorageMb ?? 1024,
        features: (dto.features ?? []) as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true,
      },
    });
    return this.mapPlan(record);
  }

  async update(id: string, dto: UpdatePlanDto) {
    await this.planResolver.resolveById(id);
    const record = await this.prisma.plan.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug.trim().toLowerCase() }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.priceMonthly !== undefined && { priceMonthly: dto.priceMonthly }),
        ...(dto.priceYearly !== undefined && { priceYearly: dto.priceYearly }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.maxProducts !== undefined && { maxProducts: dto.maxProducts }),
        ...(dto.maxUsers !== undefined && { maxUsers: dto.maxUsers }),
        ...(dto.maxStorageMb !== undefined && { maxStorageMb: dto.maxStorageMb }),
        ...(dto.features !== undefined && {
          features: dto.features as Prisma.InputJsonValue,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    return this.mapPlan(record);
  }

  async deactivate(id: string) {
    await this.planResolver.resolveById(id);
    const record = await this.prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
    return this.mapPlan(record);
  }
}

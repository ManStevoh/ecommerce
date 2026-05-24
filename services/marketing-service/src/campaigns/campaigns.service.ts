import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
  }

  async create(dto: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: {
        tenantId: this.tenantContext.getTenantId(),
        name: dto.name,
        description: dto.description,
        status: dto.status,
        channel: dto.channel,
        segmentId: dto.segmentId,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        budget: dto.budget,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async findAll() {
    return this.prisma.campaign.findMany({
      where: this.tenantWhere(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, ...this.tenantWhere() },
    });
    if (!campaign) throw new NotFoundException(`Campaign ${id} not found`);
    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto) {
    await this.findOne(id);
    const patch = dto as Partial<CreateCampaignDto>;
    return this.prisma.campaign.update({
      where: { id },
      data: {
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.description !== undefined && { description: patch.description }),
        ...(patch.status !== undefined && { status: patch.status }),
        ...(patch.channel !== undefined && { channel: patch.channel }),
        ...(patch.segmentId !== undefined && { segmentId: patch.segmentId }),
        ...(patch.startsAt !== undefined && {
          startsAt: patch.startsAt ? new Date(patch.startsAt) : null,
        }),
        ...(patch.endsAt !== undefined && {
          endsAt: patch.endsAt ? new Date(patch.endsAt) : null,
        }),
        ...(patch.budget !== undefined && { budget: patch.budget }),
        ...(patch.metadata !== undefined && {
          metadata: patch.metadata as Prisma.InputJsonValue,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.campaign.delete({ where: { id } });
    return { deleted: true, id };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CampaignStatus, Prisma } from '@nexora/database';
import { NotificationServiceClient } from '@nexora/integrations';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { SegmentsService } from '../segments/segments.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly segmentsService: SegmentsService,
    private readonly notificationClient: NotificationServiceClient,
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

  async send(id: string) {
    const campaign = await this.findOne(id);
    const tenantId = this.tenantContext.getTenantId();
    const metadata = (campaign.metadata ?? {}) as Record<string, string>;

    let recipients: { email: string }[] = [];
    if (campaign.segmentId) {
      const evaluation = await this.segmentsService.evaluate(campaign.segmentId);
      recipients = evaluation.members.map((m) => ({ email: m.email }));
    }

    if (recipients.length === 0) {
      return {
        campaignId: id,
        sent: 0,
        message: 'No recipients — attach a segment and evaluate it first',
      };
    }

    const subject = metadata.subject ?? campaign.name;
    const body =
      metadata.body ?? campaign.description ?? 'Thanks for being a customer.';

    let sent = 0;
    for (const recipient of recipients) {
      await this.notificationClient.sendEmail(tenantId, {
        to: recipient.email,
        templateId: 'campaign',
        variables: { subject, body },
      });
      sent += 1;
    }

    const existingMeta = (campaign.metadata ?? {}) as Record<string, unknown>;
    await this.prisma.campaign.update({
      where: { id },
      data: {
        status: CampaignStatus.COMPLETED,
        metadata: {
          ...existingMeta,
          lastSentAt: new Date().toISOString(),
          recipientsSent: sent,
        } as Prisma.InputJsonValue,
      },
    });

    return { campaignId: id, sent, subject };
  }

  async processAllScheduled() {
    const now = new Date();
    const due = await this.prisma.campaign.findMany({
      where: {
        status: CampaignStatus.SCHEDULED,
        startsAt: { lte: now },
      },
      orderBy: { startsAt: 'asc' },
    });

    let sent = 0;
    for (const campaign of due) {
      this.tenantContext.setTenantId(campaign.tenantId);
      const result = await this.send(campaign.id);
      sent += result.sent ?? 0;
    }

    return { processed: due.length, sent };
  }
}

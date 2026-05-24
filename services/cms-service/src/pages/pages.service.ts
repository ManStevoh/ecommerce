import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CreatePageDto, UpdatePageDto } from './dto/create-page.dto';
import { UpdatePageBlocksDto } from './dto/update-page-blocks.dto';

const blocksInclude = {
  blocks: { orderBy: { sortOrder: 'asc' as const } },
};

@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
  }

  async create(dto: CreatePageDto) {
    return this.prisma.page.create({
      data: {
        tenantId: this.tenantContext.getTenantId(),
        title: dto.title,
        slug: dto.slug,
        status: dto.status,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        ogImage: dto.ogImage,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
        blocks: dto.blocks?.length
          ? {
              create: dto.blocks.map((block, index) => ({
                type: block.type,
                sortOrder: block.sortOrder ?? index,
                config: (block.config ?? {}) as Prisma.InputJsonValue,
              })),
            }
          : undefined,
      },
      include: blocksInclude,
    });
  }

  async findAll() {
    return this.prisma.page.findMany({
      where: this.tenantWhere(),
      include: blocksInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.page.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        ...this.tenantWhere(),
      },
      include: blocksInclude,
    });
    if (!page) throw new NotFoundException(`Page ${slug} not found`);
    return page;
  }

  async findOne(id: string) {
    const page = await this.prisma.page.findFirst({
      where: { id, ...this.tenantWhere() },
      include: blocksInclude,
    });
    if (!page) throw new NotFoundException(`Page ${id} not found`);
    return page;
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.findOne(id);
    const patch = dto as Partial<CreatePageDto>;
    return this.prisma.page.update({
      where: { id },
      data: {
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.slug !== undefined && { slug: patch.slug }),
        ...(patch.status !== undefined && { status: patch.status }),
        ...(patch.metaTitle !== undefined && { metaTitle: patch.metaTitle }),
        ...(patch.metaDescription !== undefined && {
          metaDescription: patch.metaDescription,
        }),
        ...(patch.ogImage !== undefined && { ogImage: patch.ogImage }),
        ...(patch.publishedAt !== undefined && {
          publishedAt: patch.publishedAt ? new Date(patch.publishedAt) : null,
        }),
      },
      include: blocksInclude,
    });
  }

  async updateBlocks(pageId: string, dto: UpdatePageBlocksDto) {
    await this.findOne(pageId);

    await this.prisma.$transaction(async (tx) => {
      await tx.contentBlock.deleteMany({ where: { pageId } });
      if (dto.blocks.length > 0) {
        await tx.contentBlock.createMany({
          data: dto.blocks.map((block, index) => ({
            pageId,
            type: block.type,
            sortOrder: block.sortOrder ?? index,
            config: (block.config ?? {}) as Prisma.InputJsonValue,
          })),
        });
      }
    });

    return this.findOne(pageId);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.page.delete({ where: { id } });
    return { deleted: true, id };
  }
}

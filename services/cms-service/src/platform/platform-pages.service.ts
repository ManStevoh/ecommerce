import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageStatus, Prisma } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { CreatePlatformPageDto, UpdatePlatformPageDto } from './dto/platform-page.dto';
import { UpdatePlatformPageBlocksDto } from './dto/platform-page-blocks.dto';

const blocksInclude = {
  blocks: { orderBy: { sortOrder: 'asc' as const } },
};

@Injectable()
export class PlatformPagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlatformPageDto) {
    if (dto.isHomepage) {
      await this.prisma.platformPage.updateMany({
        where: { isHomepage: true },
        data: { isHomepage: false },
      });
    }

    return this.prisma.platformPage.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        isHomepage: dto.isHomepage ?? false,
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
    return this.prisma.platformPage.findMany({
      include: blocksInclude,
      orderBy: [{ isHomepage: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async findHomepage() {
    const page = await this.prisma.platformPage.findFirst({
      where: { isHomepage: true, status: PageStatus.PUBLISHED },
      include: blocksInclude,
    });
    if (!page) throw new NotFoundException('Homepage not published');
    return page;
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.platformPage.findFirst({
      where: { slug, status: PageStatus.PUBLISHED },
      include: blocksInclude,
    });
    if (!page) throw new NotFoundException(`Page ${slug} not found`);
    return page;
  }

  async findOne(id: string) {
    const page = await this.prisma.platformPage.findUnique({
      where: { id },
      include: blocksInclude,
    });
    if (!page) throw new NotFoundException(`Page ${id} not found`);
    return page;
  }

  async update(id: string, dto: UpdatePlatformPageDto) {
    await this.findOne(id);
    const patch = dto as Partial<CreatePlatformPageDto>;

    if (patch.isHomepage) {
      await this.prisma.platformPage.updateMany({
        where: { isHomepage: true, NOT: { id } },
        data: { isHomepage: false },
      });
    }

    return this.prisma.platformPage.update({
      where: { id },
      data: {
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.slug !== undefined && { slug: patch.slug }),
        ...(patch.isHomepage !== undefined && { isHomepage: patch.isHomepage }),
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

  async publish(id: string) {
    await this.findOne(id);
    return this.prisma.platformPage.update({
      where: { id },
      data: {
        status: PageStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: blocksInclude,
    });
  }

  async updateBlocks(pageId: string, dto: UpdatePlatformPageBlocksDto) {
    await this.findOne(pageId);

    await this.prisma.$transaction(async (tx) => {
      await tx.platformContentBlock.deleteMany({ where: { pageId } });
      if (dto.blocks.length > 0) {
        await tx.platformContentBlock.createMany({
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
    const page = await this.findOne(id);
    if (page.isHomepage) {
      throw new BadRequestException('Cannot delete the homepage');
    }
    await this.prisma.platformPage.delete({ where: { id } });
    return { deleted: true, id };
  }
}

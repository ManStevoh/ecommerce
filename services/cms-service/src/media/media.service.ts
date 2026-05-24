import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@nexora/database';
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CreateMediaDto, UpdateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  private readonly uploadRoot: string;
  private readonly publicBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly config: ConfigService,
  ) {
    this.uploadRoot =
      this.config.get<string>('MEDIA_UPLOAD_DIR') ??
      join(process.cwd(), 'uploads');
    this.publicBaseUrl =
      this.config.get<string>('MEDIA_PUBLIC_BASE_URL') ??
      'http://localhost:3000/api/v1/media/files';
    mkdirSync(this.uploadRoot, { recursive: true });
  }

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
  }

  async upload(file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('No file uploaded');
    }

    const tenantId = this.tenantContext.getTenantId();
    const dir = join(this.uploadRoot, tenantId);
    mkdirSync(dir, { recursive: true });

    const safeName = `${randomUUID()}${extname(file.originalname) || '.bin'}`;
    const diskPath = join(dir, safeName);
    writeFileSync(diskPath, file.buffer);

    const url = `${this.publicBaseUrl}/${tenantId}/${safeName}`;

    return this.prisma.mediaAsset.create({
      data: {
        tenantId,
        filename: file.originalname,
        url,
        mimeType: file.mimetype || 'application/octet-stream',
        sizeBytes: file.size,
      },
    });
  }

  async serveFile(tenantId: string, filename: string) {
    const diskPath = join(this.uploadRoot, tenantId, filename);
    if (!existsSync(diskPath)) {
      throw new NotFoundException('File not found');
    }

    const asset = await this.prisma.mediaAsset.findFirst({
      where: { tenantId, url: { contains: filename } },
    });

    const stream = createReadStream(diskPath);
    return new StreamableFile(stream, {
      type: asset?.mimeType ?? 'application/octet-stream',
      disposition: `inline; filename="${asset?.filename ?? filename}"`,
    });
  }

  async create(dto: CreateMediaDto) {
    return this.prisma.mediaAsset.create({
      data: {
        tenantId: this.tenantContext.getTenantId(),
        filename: dto.filename,
        url: dto.url,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        altText: dto.altText,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async findAll() {
    return this.prisma.mediaAsset.findMany({
      where: this.tenantWhere(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.mediaAsset.findFirst({
      where: { id, ...this.tenantWhere() },
    });
    if (!asset) throw new NotFoundException(`Media asset ${id} not found`);
    return asset;
  }

  async update(id: string, dto: UpdateMediaDto) {
    await this.findOne(id);
    const patch = dto as Partial<CreateMediaDto>;
    return this.prisma.mediaAsset.update({
      where: { id },
      data: {
        ...(patch.filename !== undefined && { filename: patch.filename }),
        ...(patch.url !== undefined && { url: patch.url }),
        ...(patch.mimeType !== undefined && { mimeType: patch.mimeType }),
        ...(patch.sizeBytes !== undefined && { sizeBytes: patch.sizeBytes }),
        ...(patch.altText !== undefined && { altText: patch.altText }),
        ...(patch.metadata !== undefined && {
          metadata: patch.metadata as Prisma.InputJsonValue,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.mediaAsset.delete({ where: { id } });
    return { deleted: true, id };
  }
}

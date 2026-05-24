import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';

@Injectable()
export class StoreSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(tenantId: string) {
    const settings = await this.prisma.storeSettings.findUnique({
      where: { tenantId },
    });
    if (!settings) throw new NotFoundException('Store settings not found');
    return settings;
  }

  async update(tenantId: string, dto: UpdateStoreSettingsDto) {
    return this.prisma.storeSettings.upsert({
      where: { tenantId },
      create: { tenantId, ...dto },
      update: dto,
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateThemeSettingsDto } from './dto/update-theme-settings.dto';

@Injectable()
export class ThemeSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(tenantId: string) {
    const settings = await this.prisma.themeSettings.findUnique({
      where: { tenantId },
    });
    if (!settings) throw new NotFoundException('Theme settings not found');
    return settings;
  }

  async update(tenantId: string, dto: UpdateThemeSettingsDto) {
    return this.prisma.themeSettings.upsert({
      where: { tenantId },
      create: { tenantId, ...dto },
      update: dto,
    });
  }
}

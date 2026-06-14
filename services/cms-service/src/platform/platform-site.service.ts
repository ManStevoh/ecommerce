import { Injectable } from '@nestjs/common';
import { Prisma } from '@nexora/database';
import { PrismaService } from '../database/prisma.service';
import { UpdatePlatformSiteSettingsDto } from './dto/platform-site-settings.dto';

const SETTINGS_ID = 'default';

@Injectable()
export class PlatformSiteService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    return this.prisma.platformSiteSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
    });
  }

  async updateSettings(dto: UpdatePlatformSiteSettingsDto) {
    await this.getSettings();
    return this.prisma.platformSiteSettings.update({
      where: { id: SETTINGS_ID },
      data: {
        ...(dto.siteName !== undefined && { siteName: dto.siteName }),
        ...(dto.tagline !== undefined && { tagline: dto.tagline }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.faviconUrl !== undefined && { faviconUrl: dto.faviconUrl }),
        ...(dto.primaryCtaLabel !== undefined && {
          primaryCtaLabel: dto.primaryCtaLabel,
        }),
        ...(dto.primaryCtaHref !== undefined && {
          primaryCtaHref: dto.primaryCtaHref,
        }),
        ...(dto.navLinks !== undefined && {
          navLinks: dto.navLinks as Prisma.InputJsonValue,
        }),
        ...(dto.footerColumns !== undefined && {
          footerColumns: dto.footerColumns as Prisma.InputJsonValue,
        }),
        ...(dto.footerNote !== undefined && { footerNote: dto.footerNote }),
      },
    });
  }
}

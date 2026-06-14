import { Injectable, NotFoundException } from '@nestjs/common';
import { LAYOUT_VARIANTS, PRESET_LAYOUT_VARIANTS, THEME_PRESETS, applyThemePreset } from '@nexora/themes';
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

  listPresets() {
    return THEME_PRESETS.map(({ slug, name, description, primaryColor, secondaryColor, accentColor, darkMode, backgroundColor, textColor, surfaceColor, borderColor, mutedColor }) => ({
      slug,
      name,
      description,
      primaryColor,
      secondaryColor,
      accentColor,
      darkMode,
      backgroundColor,
      textColor,
      surfaceColor,
      borderColor,
      mutedColor,
      defaultLayoutVariant: PRESET_LAYOUT_VARIANTS[slug],
    }));
  }

  listLayoutVariants() {
    return LAYOUT_VARIANTS;
  }

  async update(tenantId: string, dto: UpdateThemeSettingsDto) {
    const raw =
      dto.themePreset != null
        ? applyThemePreset(dto.themePreset, {
            primaryColor: dto.primaryColor,
            secondaryColor: dto.secondaryColor,
            accentColor: dto.accentColor,
            fontFamily: dto.fontFamily,
            logoUrl: dto.logoUrl,
            faviconUrl: dto.faviconUrl,
            darkMode: dto.darkMode,
            customCss: dto.customCss,
            customColors: dto.customColors,
          })
        : { ...dto };

    const data = {
      ...raw,
      themePreset: raw.themePreset ?? undefined,
      layoutVariant: raw.layoutVariant ?? undefined,
      logoUrl: raw.logoUrl ?? undefined,
      faviconUrl: raw.faviconUrl ?? undefined,
      customCss: raw.customCss ?? undefined,
      customColors: raw.customColors ?? undefined,
    };

    return this.prisma.themeSettings.upsert({
      where: { tenantId },
      create: { tenantId, ...data },
      update: data,
    });
  }
}

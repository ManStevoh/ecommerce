import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePlatformSiteSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  siteName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  tagline?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  primaryCtaLabel?: string;

  @IsOptional()
  @IsString()
  primaryCtaHref?: string;

  @IsOptional()
  @IsArray()
  navLinks?: Array<{ label: string; href: string }>;

  @IsOptional()
  @IsArray()
  footerColumns?: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  footerNote?: string;
}

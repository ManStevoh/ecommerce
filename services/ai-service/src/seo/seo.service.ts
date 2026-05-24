import { Injectable } from '@nestjs/common';
import { OptimizeSeoDto } from './dto/optimize-seo.dto';
import { OpenAiClient } from '../lib/openai.client';

@Injectable()
export class SeoService {
  constructor(private readonly openai: OpenAiClient) {}

  async optimize(dto: OptimizeSeoDto) {
    const keywords = dto.targetKeywords?.split(',').map((k) => k.trim()) ?? [];

    const result = await this.openai.chat(
      'You are an SEO expert for eCommerce. Return JSON only with keys: metaTitle, metaDescription, suggestedKeywords (array), schemaMarkup (object).',
      `Optimize SEO for product/page: "${dto.title}". Description: ${dto.description ?? dto.title}. Target keywords: ${keywords.join(', ') || 'auto'}.`,
    );

    if (result.stub) {
      return {
        source: 'fallback',
        tenantId: dto.tenantId,
        optimized: {
          metaTitle: `${dto.title} | Shop Now`.slice(0, 60),
          metaDescription: (dto.description ?? dto.title).slice(0, 155),
          suggestedKeywords: keywords.length
            ? keywords
            : ['buy online', 'free shipping', dto.title.toLowerCase()],
          schemaMarkup: {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: dto.title,
          },
        },
      };
    }

    try {
      const optimized = JSON.parse(result.content) as Record<string, unknown>;
      return { stub: false, tenantId: dto.tenantId, optimized, model: result.model };
    } catch {
      return {
        stub: false,
        tenantId: dto.tenantId,
        optimized: {
          metaTitle: result.content.slice(0, 60),
          metaDescription: dto.description?.slice(0, 155),
          suggestedKeywords: keywords,
          schemaMarkup: { '@context': 'https://schema.org', '@type': 'Product', name: dto.title },
        },
      };
    }
  }
}

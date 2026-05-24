import { Injectable } from '@nestjs/common';
import { GenerateProductDescriptionDto } from './dto/generate-product-description.dto';
import { OpenAiClient } from '../lib/openai.client';

export interface OpenAiCompatibleResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: 'assistant'; content: string };
    finish_reason: 'stop';
  }>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  stub?: boolean;
}

@Injectable()
export class ProductDescriptionService {
  constructor(private readonly openai: OpenAiClient) {}

  async generate(dto: GenerateProductDescriptionDto): Promise<OpenAiCompatibleResponse> {
    const attributes = dto.attributes?.length
      ? `Features: ${dto.attributes.join(', ')}.`
      : '';

    const result = await this.openai.chat(
      'You are an expert eCommerce copywriter. Write compelling product descriptions optimized for conversion and SEO.',
      `Product: ${dto.productName}. Brief: ${dto.brief ?? 'Premium product'}. ${attributes} Tone: ${dto.tone ?? 'professional'}. Locale: ${dto.locale ?? 'en'}.`,
    );

    return {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: result.model,
      stub: result.stub,
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: result.content },
          finish_reason: 'stop',
        },
      ],
      usage: result.usage ?? {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatCompletionResult {
  content: string;
  model: string;
  stub: boolean;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

@Injectable()
export class OpenAiClient {
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('OPENAI_API_KEY');
    this.model = this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey?.trim());
  }

  async chat(system: string, user: string): Promise<ChatCompletionResult> {
    if (!this.isConfigured) {
      return {
        content: `[Dev stub] ${user.slice(0, 200)}`,
        model: 'stub',
        stub: true,
      };
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${err}`);
    }

    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
      model: string;
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    return {
      content: data.choices[0]?.message?.content ?? '',
      model: data.model,
      stub: false,
      usage: data.usage,
    };
  }
}

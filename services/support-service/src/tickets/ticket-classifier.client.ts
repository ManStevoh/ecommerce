import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TicketPriority } from '@nexora/database';
import {
  createAiTicketClassifierClient,
  type TicketClassification,
} from '@nexora/integrations';

export type { TicketClassification };

@Injectable()
export class TicketClassifierClient {
  private readonly classifier;

  constructor(config: ConfigService) {
    this.classifier = createAiTicketClassifierClient(
      config.get<string>('AI_SERVICE_URL'),
    );
  }

  async classify(
    subject: string,
    description: string,
  ): Promise<TicketClassification & { priority: TicketPriority }> {
    const result = await this.classifier.classify(subject, description);
    return {
      ...result,
      priority: result.priority as TicketPriority,
    };
  }
}

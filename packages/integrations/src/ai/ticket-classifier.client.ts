export type TicketClassification = {
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  confidence: number;
  tags: string[];
};

export class AiTicketClassifierClient {
  constructor(private readonly baseUrl: string) {}

  async classify(
    subject: string,
    description: string,
  ): Promise<TicketClassification> {
    const res = await fetch(`${this.baseUrl}/api/v1/ai/tickets/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, description }),
    });
    if (res.ok) {
      return (await res.json()) as TicketClassification;
    }
    return this.localClassify(subject, description);
  }

  private localClassify(
    subject: string,
    description: string,
  ): TicketClassification {
    const text = `${subject} ${description}`.toLowerCase();
    if (/urgent|emergency|asap/.test(text)) {
      return {
        category: 'urgent',
        priority: 'URGENT',
        confidence: 0.7,
        tags: ['urgent'],
      };
    }
    if (/refund|billing|payment|charge/.test(text)) {
      return {
        category: 'billing',
        priority: 'HIGH',
        confidence: 0.65,
        tags: ['billing'],
      };
    }
    return {
      category: 'general',
      priority: 'MEDIUM',
      confidence: 0.5,
      tags: ['general'],
    };
  }
}

export function createAiTicketClassifierClient(
  baseUrl?: string,
): AiTicketClassifierClient {
  return new AiTicketClassifierClient(
    baseUrl ?? process.env.AI_SERVICE_URL ?? 'http://localhost:3007',
  );
}

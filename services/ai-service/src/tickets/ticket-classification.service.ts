import { Injectable } from '@nestjs/common';
import { TicketPriority } from '@nexora/database';
import { ClassifyTicketDto, TicketClassification } from './dto/classify-ticket.dto';

const RULES: {
  keywords: string[];
  category: string;
  priority: TicketPriority;
  tags: string[];
}[] = [
  {
    keywords: ['urgent', 'asap', 'emergency', 'immediately', 'not working'],
    category: 'urgent',
    priority: TicketPriority.URGENT,
    tags: ['urgent'],
  },
  {
    keywords: ['refund', 'charge', 'billing', 'payment', 'invoice', 'charged twice'],
    category: 'billing',
    priority: TicketPriority.HIGH,
    tags: ['billing', 'payments'],
  },
  {
    keywords: ['shipping', 'delivery', 'tracking', 'lost package', 'delayed'],
    category: 'shipping',
    priority: TicketPriority.MEDIUM,
    tags: ['shipping', 'fulfillment'],
  },
  {
    keywords: ['broken', 'defect', 'damaged', 'return', 'exchange', 'warranty'],
    category: 'product_issue',
    priority: TicketPriority.HIGH,
    tags: ['product', 'returns'],
  },
];

@Injectable()
export class TicketClassificationService {
  classify(dto: ClassifyTicketDto): TicketClassification {
    const text = `${dto.subject} ${dto.description}`.toLowerCase();

    for (const rule of RULES) {
      const hits = rule.keywords.filter((kw) => text.includes(kw));
      if (hits.length) {
        return {
          category: rule.category,
          priority: rule.priority,
          confidence: Math.min(0.65 + hits.length * 0.1, 0.95),
          tags: [...rule.tags, ...hits.slice(0, 2)],
        };
      }
    }

    return {
      category: 'general',
      priority: TicketPriority.MEDIUM,
      confidence: 0.55,
      tags: ['general'],
    };
  }
}

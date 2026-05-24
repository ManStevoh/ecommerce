import type { Prisma } from '@prisma/client';
import { OutboxStatus } from '@prisma/client';

type OutboxClient = {
  eventOutbox: {
    create: (args: {
      data: {
        tenantId?: string | null;
        topic: string;
        payload: Prisma.InputJsonValue;
        status?: OutboxStatus;
      };
    }) => Promise<unknown>;
  };
};

export async function enqueueOutbox(
  client: OutboxClient,
  input: {
    tenantId?: string | null;
    topic: string;
    payload: Prisma.InputJsonValue;
  },
) {
  return client.eventOutbox.create({
    data: {
      tenantId: input.tenantId,
      topic: input.topic,
      payload: input.payload,
      status: OutboxStatus.PENDING,
    },
  });
}

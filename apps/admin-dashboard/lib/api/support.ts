import { API_BASE, TENANT_ID, apiHeaders } from './client';

export type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  customerEmail: string;
  status: string;
  priority: string;
  createdAt: string;
};

export async function fetchTickets(): Promise<SupportTicket[]> {
  if (!TENANT_ID) return [];
  const res = await fetch(
    `${API_BASE}/api/v1/tickets?tenantId=${TENANT_ID}`,
    { headers: apiHeaders(), cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json();
}

export async function createTicket(data: {
  subject: string;
  description: string;
  customerEmail: string;
}): Promise<SupportTicket> {
  const res = await fetch(`${API_BASE}/api/v1/tickets`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify({ ...data, tenantId: TENANT_ID }),
  });
  if (!res.ok) throw new Error('Failed to create ticket');
  return res.json();
}

export async function updateTicketStatus(
  ticketId: string,
  status: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: apiHeaders(),
    body: JSON.stringify({ status: status.toUpperCase() }),
  });
  if (!res.ok) throw new Error('Failed to update ticket');
}

export async function escalateTicket(ticketId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/tickets/${ticketId}/escalate`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify({ reason: 'Escalated from admin dashboard' }),
  });
  if (!res.ok) throw new Error('Failed to escalate ticket');
}

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Textarea,
} from '@nexora/ui';
import {
  createTicket,
  escalateTicket,
  fetchTickets,
  updateTicketStatus,
} from '@/lib/api';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function SupportPage() {
  const queryClient = useQueryClient();
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: fetchTickets,
  });

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('owner@freshfish.demo');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createTicket({ subject, description, customerEmail: email });
      setSubject('');
      setDescription('');
      await queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    } catch {
      setError('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Support tickets</h1>
        <p className="text-zinc-500">Customer support queue for your store</p>
      </div>

      <Card className="mb-8 max-w-xl">
        <CardHeader>
          <CardTitle>New ticket</CardTitle>
          <CardDescription>Create a ticket on behalf of a customer</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleCreate(e)} className="space-y-3">
            <div>
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input
                id="ticket-subject"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="ticket-email">Customer email</Label>
              <Input
                id="ticket-email"
                placeholder="Customer email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="ticket-description">Description</Label>
              <Textarea
                id="ticket-description"
                rows={4}
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create ticket'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-zinc-500">Loading…</p>
          ) : !tickets?.length ? (
            <p className="text-zinc-500">No tickets yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="pb-3 pr-4 font-medium">Subject</th>
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Priority</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 font-medium">{ticket.subject}</td>
                    <td className="py-3 pr-4">{ticket.customerEmail}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="secondary">{ticket.priority}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Select
                        className="h-8 text-xs"
                        value={ticket.status}
                        onChange={(e) =>
                          void updateTicketStatus(ticket.id, e.target.value).then(
                            () =>
                              queryClient.invalidateQueries({
                                queryKey: ['support-tickets'],
                              }),
                          )
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          void escalateTicket(ticket.id).then(() =>
                            queryClient.invalidateQueries({
                              queryKey: ['support-tickets'],
                            }),
                          )
                        }
                      >
                        Escalate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

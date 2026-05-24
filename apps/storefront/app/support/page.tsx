'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Textarea,
} from '@nexora/ui';
import { createSupportTicket, fetchMyTickets } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { EmptyState, LoadingBlock, PageHeader } from '@/components/page-shell';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

export default function SupportPage() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [tickets, setTickets] = useState<
    Awaited<ReturnType<typeof fetchMyTickets>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user?.email) setEmail(user.email);
  }, []);

  useEffect(() => {
    if (!TENANT_ID || !email) {
      setLoading(false);
      return;
    }
    void fetchMyTickets(TENANT_ID, email).then((rows) => {
      setTickets(rows);
      setLoading(false);
    });
  }, [email, success]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!TENANT_ID) {
      setError('Store not configured');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await createSupportTicket(TENANT_ID, {
        subject,
        description,
        customerEmail: email,
      });
      setSubject('');
      setDescription('');
      setSuccess('Your ticket was submitted. We will respond by email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Customer support"
        description="Submit a request and track responses from our team."
      />

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>New request</CardTitle>
          <CardDescription>
            Describe your issue and we will get back to you by email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <Label htmlFor="support-email">Email</Label>
              <Input
                id="support-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="support-subject">Subject</Label>
              <Input
                id="support-subject"
                placeholder="Brief summary"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="support-description">Message</Label>
              <Textarea
                id="support-description"
                rows={5}
                placeholder="How can we help?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
            <Button type="submit" variant="luxury" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit ticket'}
            </Button>
          </form>
          <p className="mt-4 text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Your tickets</CardTitle>
          <CardDescription>
            {email ? `Showing requests for ${email}` : 'Enter your email above'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!email ? (
            <p className="text-sm text-zinc-500">
              Enter your email to view tickets.
            </p>
          ) : loading ? (
            <LoadingBlock rows={3} />
          ) : !tickets.length ? (
            <EmptyState
              title="No tickets yet"
              description="When you submit a request, it will appear here."
            />
          ) : (
            <ul className="space-y-4">
              {tickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="rounded-xl border border-zinc-200/60 p-4 dark:border-zinc-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{ticket.subject}</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{ticket.status}</Badge>
                      <Badge variant="outline">{ticket.priority}</Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {ticket.description}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Opened {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

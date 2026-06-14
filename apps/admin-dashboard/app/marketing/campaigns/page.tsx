'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  PageHeader,
} from '@nexora/ui';
import { fetchSegments } from '@/lib/api';
import { createCampaign, fetchCampaigns, sendCampaign } from '@/lib/marketing-api';

export default function CampaignsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  });
  const { data: segments = [] } = useQuery({
    queryKey: ['segments'],
    queryFn: fetchSegments,
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [schedule, setSchedule] = useState(false);

  const createMut = useMutation({
    mutationFn: () =>
      createCampaign({
        name,
        description: description || undefined,
        segmentId: segmentId || undefined,
        channel: 'email',
        status: schedule ? 'SCHEDULED' : 'DRAFT',
        startsAt: schedule && startsAt ? new Date(startsAt).toISOString() : undefined,
        metadata: {
          subject: subject || name,
          body: body || description || 'Thanks for being a customer.',
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setName('');
      setDescription('');
      setSegmentId('');
      setSubject('');
      setBody('');
      setStartsAt('');
      setSchedule(false);
    },
  });

  const sendMut = useMutation({
    mutationFn: (id: string) => sendCampaign(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  return (
    <div className="admin-page">
      <PageHeader
        title="Campaigns"
        description="Email campaigns targeted at customer segments"
        action={
          <Link href="/marketing">
            <Button variant="outline" size="sm">
              Marketing hub
            </Button>
          </Link>
        }
      />

      <Card className="mb-6 border-zinc-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>New campaign</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Campaign name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select
              className="rounded-md border border-zinc-200 px-3 py-2 text-sm"
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value)}
            >
              <option value="">No segment (manual send only)</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.memberCount} members)
                </option>
              ))}
            </select>
          </div>
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            className="min-h-[80px] w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            placeholder="Email body — mention coupon codes like WELCOME10"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={schedule}
              onChange={(e) => setSchedule(e.target.checked)}
            />
            Schedule for later (auto-send via cron)
          </label>
          {schedule && (
            <Input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          )}
          <Button
            onClick={() => createMut.mutate()}
            disabled={!name || createMut.isPending}
          >
            {schedule ? 'Schedule campaign' : 'Create campaign'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-zinc-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>All campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-zinc-500">Loading…</p>
          ) : !data?.length ? (
            <p className="text-zinc-500">No campaigns yet. Create one above or run db:seed.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Channel</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 font-medium">{c.name}</td>
                    <td className="py-3 pr-4 capitalize">{c.channel}</td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={
                          c.status === 'ACTIVE' || c.status === 'COMPLETED'
                            ? 'success'
                            : 'secondary'
                        }
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={sendMut.isPending || c.status === 'COMPLETED'}
                        onClick={() => sendMut.mutate(c.id)}
                      >
                        Send now
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

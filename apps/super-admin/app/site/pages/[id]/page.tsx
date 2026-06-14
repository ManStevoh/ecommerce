'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@nexora/ui';
import {
  fetchPlatformPage,
  publishPlatformPage,
  updatePlatformPage,
  updatePlatformPageBlocks,
  type PlatformBlock,
} from '@/lib/api/platform-site';

const BLOCK_TYPES = [
  'HERO',
  'LOGO_STRIP',
  'FEATURES_GRID',
  'STATS_BAR',
  'PRICING',
  'TESTIMONIALS',
  'FAQ',
  'CTA',
  'RICH_TEXT',
];

const DEFAULT_CONFIG: Record<string, Record<string, unknown>> = {
  HERO: {
    eyebrow: 'Commerce platform',
    headline: 'Headline',
    subheadline: 'Supporting text',
    primaryLabel: 'Get started',
    primaryHref: 'http://localhost:3200/login',
    secondaryLabel: 'View pricing',
    secondaryHref: '#pricing',
  },
  LOGO_STRIP: { title: 'Trusted by teams worldwide', logos: ['Brand A', 'Brand B'] },
  FEATURES_GRID: {
    title: 'Features',
    subtitle: 'Everything you need to sell online',
    items: [{ title: 'Feature', description: 'Description' }],
  },
  STATS_BAR: {
    items: [
      { value: '99.9%', label: 'Uptime' },
      { value: '50+', label: 'Countries' },
    ],
  },
  PRICING: { title: 'Pricing', subtitle: 'Simple plans for every stage' },
  TESTIMONIALS: {
    title: 'Testimonials',
    items: [{ quote: 'Quote', author: 'Name', role: 'Role' }],
  },
  FAQ: {
    title: 'FAQ',
    items: [{ q: 'Question?', a: 'Answer.' }],
  },
  CTA: {
    title: 'Ready to get started?',
    subtitle: 'Launch your store today.',
    buttonLabel: 'Start free trial',
    buttonHref: 'http://localhost:3200/login',
  },
  RICH_TEXT: { title: 'Section title', body: 'Body copy.' },
};

export default function EditSitePage() {
  const params = useParams<{ id: string }>();
  const pageId = params.id;
  const queryClient = useQueryClient();
  const { data: page, isLoading } = useQuery({
    queryKey: ['platform-page', pageId],
    queryFn: () => fetchPlatformPage(pageId),
  });

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [blocks, setBlocks] = useState<PlatformBlock[]>([]);
  const [blockJson, setBlockJson] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!page) return;
    setTitle(page.title);
    setSlug(page.slug);
    setMetaTitle(page.metaTitle ?? '');
    setMetaDescription(page.metaDescription ?? '');
    const nextBlocks = page.blocks.map((b) => ({
      type: b.type,
      sortOrder: b.sortOrder,
      config: b.config,
    }));
    setBlocks(nextBlocks);
    setBlockJson(nextBlocks.map((b) => JSON.stringify(b.config ?? {}, null, 2)));
  }, [page]);

  const saveMetaMut = useMutation({
    mutationFn: () =>
      updatePlatformPage(pageId, {
        title,
        slug,
        metaTitle,
        metaDescription,
      }),
    onSuccess: () => {
      setMessage('Page details saved.');
      queryClient.invalidateQueries({ queryKey: ['platform-page', pageId] });
    },
  });

  const saveBlocksMut = useMutation({
    mutationFn: () => {
      const parsed = blockJson.map((json, index) => {
        try {
          return JSON.parse(json) as Record<string, unknown>;
        } catch {
          throw new Error(`Invalid JSON in block ${index + 1}`);
        }
      });
      return updatePlatformPageBlocks(
        pageId,
        blocks.map((b, index) => ({
          ...b,
          sortOrder: index,
          config: parsed[index],
        })),
      );
    },
    onSuccess: () => {
      setMessage('Content blocks saved.');
      queryClient.invalidateQueries({ queryKey: ['platform-page', pageId] });
    },
    onError: (err) => {
      setMessage(err instanceof Error ? err.message : 'Failed to save blocks.');
    },
  });

  const publishMut = useMutation({
    mutationFn: () => publishPlatformPage(pageId),
    onSuccess: () => {
      setMessage('Page published.');
      queryClient.invalidateQueries({ queryKey: ['platform-page', pageId] });
      queryClient.invalidateQueries({ queryKey: ['platform-pages'] });
    },
  });

  function addBlock(type: string) {
    const config = DEFAULT_CONFIG[type] ?? {};
    setBlocks((prev) => [
      ...prev,
      { type, sortOrder: prev.length, config },
    ]);
    setBlockJson((prev) => [...prev, JSON.stringify(config, null, 2)]);
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
    setBlockJson((prev) => prev.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setBlockJson((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  if (isLoading || !page) {
    return <div className="p-8 text-slate-400">Loading…</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit page</h1>
          <p className="text-slate-400">{page.isHomepage ? 'Homepage' : page.slug}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/site/pages">
            <Button variant="outline">Back</Button>
          </Link>
          <Button
            variant="outline"
            disabled={publishMut.isPending}
            onClick={() => publishMut.mutate()}
          >
            {page.status === 'PUBLISHED' ? 'Republish' : 'Publish'}
          </Button>
        </div>
      </div>

      {message && <p className="mb-4 text-sm text-emerald-400">{message}</p>}

      <Card className="mb-6 border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Page details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-slate-700 bg-slate-950 text-white"
            placeholder="Title"
          />
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="border-slate-700 bg-slate-950 text-white"
            placeholder="Slug"
          />
          <Input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="border-slate-700 bg-slate-950 text-white md:col-span-2"
            placeholder="SEO title"
          />
          <Input
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="border-slate-700 bg-slate-950 text-white md:col-span-2"
            placeholder="SEO description"
          />
          <Button onClick={() => saveMetaMut.mutate()} disabled={saveMetaMut.isPending}>
            Save details
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Content blocks</CardTitle>
          <div className="flex flex-wrap gap-2">
            {BLOCK_TYPES.map((type) => (
              <Button key={type} size="sm" variant="outline" onClick={() => addBlock(type)}>
                + {type}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {blocks.map((block, index) => (
            <div key={`${block.type}-${index}`} className="rounded-lg border border-slate-800 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-white">
                  {index + 1}. {block.type}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => moveBlock(index, -1)}>
                    Up
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => moveBlock(index, 1)}>
                    Down
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeBlock(index)}>
                    Remove
                  </Button>
                </div>
              </div>
              <textarea
                className="min-h-[140px] w-full rounded-md border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-200"
                value={blockJson[index] ?? '{}'}
                onChange={(e) =>
                  setBlockJson((prev) => {
                    const next = [...prev];
                    next[index] = e.target.value;
                    return next;
                  })
                }
              />
            </div>
          ))}
          <Button onClick={() => saveBlocksMut.mutate()} disabled={saveBlocksMut.isPending}>
            Save blocks
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

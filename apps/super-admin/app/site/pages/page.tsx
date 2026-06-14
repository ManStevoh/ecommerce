'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@nexora/ui';
import {
  createPlatformPage,
  fetchPlatformPages,
  publishPlatformPage,
} from '@/lib/api/platform-site';

export default function SitePagesPage() {
  const queryClient = useQueryClient();
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['platform-pages'],
    queryFn: fetchPlatformPages,
  });
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  const createMut = useMutation({
    mutationFn: () =>
      createPlatformPage({
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
        isHomepage: pages.length === 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-pages'] });
      setTitle('');
      setSlug('');
    },
  });

  const publishMut = useMutation({
    mutationFn: (id: string) => publishPlatformPage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform-pages'] }),
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Site pages</h1>
          <p className="text-slate-400">CMS pages for the public marketing site</p>
        </div>
        <Link href="/site">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      <Card className="mb-6 border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">New page</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input
            placeholder="Page title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-slate-700 bg-slate-950 text-white"
          />
          <Input
            placeholder="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="border-slate-700 bg-slate-950 text-white"
          />
          <Button onClick={() => createMut.mutate()} disabled={!title || createMut.isPending}>
            Create draft
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Pages</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-400">Loading…</p>
          ) : (
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-left text-slate-500">
                  <th className="pb-3 pr-4">Title</th>
                  <th className="pb-3 pr-4">Slug</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-b border-slate-800/80">
                    <td className="py-3 pr-4 font-medium text-white">
                      {page.title}
                      {page.isHomepage && (
                        <span className="ml-2 text-xs text-violet-400">Homepage</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-500">/{page.slug === 'home' ? '' : page.slug}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={page.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                        {page.status}
                      </Badge>
                    </td>
                    <td className="py-3 space-x-2">
                      <Link href={`/site/pages/${page.id}`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                      {page.status !== 'PUBLISHED' && (
                        <Button
                          size="sm"
                          disabled={publishMut.isPending}
                          onClick={() => publishMut.mutate(page.id)}
                        >
                          Publish
                        </Button>
                      )}
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

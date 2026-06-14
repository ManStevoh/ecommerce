'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@nexora/ui';
import { fetchPlatformPages, fetchPlatformSiteSettings } from '@/lib/api/platform-site';

const PLATFORM_SITE_URL =
  process.env.NEXT_PUBLIC_PLATFORM_SITE_URL ?? 'http://localhost:3400';

export default function SiteOverviewPage() {
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['platform-pages'],
    queryFn: fetchPlatformPages,
  });
  const { data: settings } = useQuery({
    queryKey: ['platform-site-settings'],
    queryFn: fetchPlatformSiteSettings,
  });

  const homepage = pages.find((p) => p.isHomepage);

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Marketing site</h1>
          <p className="text-slate-400">
            Public landing page before subscription — editable via CMS
          </p>
        </div>
        <a href={PLATFORM_SITE_URL} target="_blank" rel="noreferrer">
          <Button variant="outline">View live site</Button>
        </a>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900">
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold text-white">{settings?.siteName ?? '—'}</p>
            <p className="text-sm text-slate-400">Site name</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold text-white">{pages.length}</p>
            <p className="text-sm text-slate-400">CMS pages</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardContent className="pt-6">
            <Badge variant={homepage?.status === 'PUBLISHED' ? 'success' : 'secondary'}>
              {homepage?.status ?? 'NONE'}
            </Badge>
            <p className="mt-2 text-sm text-slate-400">Homepage status</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-white">Homepage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            {isLoading ? (
              <p>Loading…</p>
            ) : homepage ? (
              <>
                <p>{homepage.title}</p>
                <p className="text-slate-500">{homepage.blocks.length} content blocks</p>
                <Link href={`/site/pages/${homepage.id}`}>
                  <Button size="sm">Edit homepage</Button>
                </Link>
              </>
            ) : (
              <p>No homepage configured. Create one in Pages.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-white">Site settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>Navigation, footer, logo, and primary CTA</p>
            <Link href="/site/settings">
              <Button size="sm" variant="outline">
                Edit settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-slate-800 bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">All pages</CardTitle>
          <Link href="/site/pages">
            <Button size="sm" variant="outline">
              Manage pages
            </Button>
          </Link>
        </CardHeader>
      </Card>
    </div>
  );
}

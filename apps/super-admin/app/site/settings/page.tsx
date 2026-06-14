'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@nexora/ui';
import {
  fetchPlatformSiteSettings,
  updatePlatformSiteSettings,
} from '@/lib/api/platform-site';

export default function SiteSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['platform-site-settings'],
    queryFn: fetchPlatformSiteSettings,
  });

  const [siteName, setSiteName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState('');
  const [primaryCtaHref, setPrimaryCtaHref] = useState('');
  const [navLinksJson, setNavLinksJson] = useState('[]');
  const [footerColumnsJson, setFooterColumnsJson] = useState('[]');
  const [footerNote, setFooterNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    setSiteName(settings.siteName);
    setTagline(settings.tagline ?? '');
    setLogoUrl(settings.logoUrl ?? '');
    setPrimaryCtaLabel(settings.primaryCtaLabel ?? '');
    setPrimaryCtaHref(settings.primaryCtaHref ?? '');
    setNavLinksJson(JSON.stringify(settings.navLinks ?? [], null, 2));
    setFooterColumnsJson(JSON.stringify(settings.footerColumns ?? [], null, 2));
    setFooterNote(settings.footerNote ?? '');
  }, [settings]);

  const saveMut = useMutation({
    mutationFn: () => {
      let navLinks;
      let footerColumns;
      try {
        navLinks = JSON.parse(navLinksJson);
        footerColumns = JSON.parse(footerColumnsJson);
      } catch {
        throw new Error('Invalid JSON in navigation or footer fields.');
      }
      return updatePlatformSiteSettings({
        siteName,
        tagline,
        logoUrl: logoUrl || undefined,
        primaryCtaLabel,
        primaryCtaHref,
        navLinks,
        footerColumns,
        footerNote,
      });
    },
    onSuccess: () => {
      setMessage('Site settings saved.');
      queryClient.invalidateQueries({ queryKey: ['platform-site-settings'] });
    },
    onError: (err) =>
      setMessage(err instanceof Error ? err.message : 'Save failed — check JSON format.'),
  });

  if (isLoading) {
    return <div className="p-8 text-slate-400">Loading…</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Site settings</h1>
          <p className="text-slate-400">Header, footer, and global branding</p>
        </div>
        <Link href="/site">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {message && <p className="mb-4 text-sm text-emerald-400">{message}</p>}

      <Card className="mb-6 border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Branding</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="border-slate-700 bg-slate-950 text-white"
            placeholder="Site name"
          />
          <Input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="border-slate-700 bg-slate-950 text-white"
            placeholder="Tagline"
          />
          <Input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="border-slate-700 bg-slate-950 text-white md:col-span-2"
            placeholder="Logo URL (optional)"
          />
          <Input
            value={primaryCtaLabel}
            onChange={(e) => setPrimaryCtaLabel(e.target.value)}
            className="border-slate-700 bg-slate-950 text-white"
            placeholder="Primary CTA label"
          />
          <Input
            value={primaryCtaHref}
            onChange={(e) => setPrimaryCtaHref(e.target.value)}
            className="border-slate-700 bg-slate-950 text-white"
            placeholder="Primary CTA URL"
          />
        </CardContent>
      </Card>

      <Card className="mb-6 border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Navigation links (JSON)</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="min-h-[120px] w-full rounded-md border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-200"
            value={navLinksJson}
            onChange={(e) => setNavLinksJson(e.target.value)}
          />
          <p className="mt-2 text-xs text-slate-500">
            Example: [{'{'}&quot;label&quot;:&quot;Pricing&quot;,&quot;href&quot;:&quot;#pricing&quot;{'}'}]
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6 border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Footer columns (JSON)</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="min-h-[160px] w-full rounded-md border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-200"
            value={footerColumnsJson}
            onChange={(e) => setFooterColumnsJson(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Footer note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={footerNote}
            onChange={(e) => setFooterNote(e.target.value)}
            className="border-slate-700 bg-slate-950 text-white"
            placeholder="© 2026 Nexora. All rights reserved."
          />
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            Save settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

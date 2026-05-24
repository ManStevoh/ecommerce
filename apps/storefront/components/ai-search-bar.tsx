'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, Sparkles } from 'lucide-react';
import { Input, Badge } from '@nexora/ui';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const suggestions = [
  'salmon',
  'prawns',
  'fresh fish',
];

async function searchProducts(q: string) {
  if (!q.trim() || !TENANT_ID) return null;
  const params = new URLSearchParams({
    tenantId: TENANT_ID,
    q: q.trim(),
    limit: '5',
  });
  const res = await fetch(
    `${API_URL}/api/v1/search/products?${params.toString()}`,
  );
  if (!res.ok) return null;
  return res.json() as Promise<{
    hits?: { id: string; slug?: string; name: string; price?: number }[];
  }>;
}

export function AiSearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const { data: results } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchProducts(query),
    enabled: query.length >= 2 && Boolean(TENANT_ID),
  });

  const hits = results?.hits ?? [];

  return (
    <div className="relative w-full">
      <div className="glass-card flex items-center gap-2 px-3 py-1">
        <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search products…"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <Search className="h-4 w-4 shrink-0 text-zinc-400" />
      </div>
      {focused && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-zinc-200/60 bg-white/95 p-3 shadow-xl backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/95">
          {hits.length > 0 ? (
            <ul className="space-y-2">
              {hits.map((hit) => (
                <li key={hit.id}>
                  <Link
                    href={`/product/${hit.slug ?? hit.id}`}
                    className="block rounded-lg px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {hit.name}
                    {hit.price != null && (
                      <span className="ml-2 text-zinc-500">
                        KES {hit.price}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Try searching
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => setQuery(s)}
                    className="cursor-pointer"
                  >
                    <Badge variant="secondary">{s}</Badge>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

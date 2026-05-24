import type { MetadataRoute } from 'next';
import { fetchProducts } from '@/lib/api';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';
const BASE = process.env.NEXT_PUBLIC_STORE_URL ?? 'http://localhost:3100';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/cart`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE}/register`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  if (!TENANT_ID) return staticRoutes;

  const products = await fetchProducts(TENANT_ID);
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}

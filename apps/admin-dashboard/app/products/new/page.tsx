'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@nexora/ui';
import { createProduct } from '@/lib/api';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const product = await createProduct({
        name: form.get('name') as string,
        slug: form.get('slug') as string,
        description: (form.get('description') as string) || undefined,
        basePrice: parseFloat(form.get('price') as string),
        stockQuantity: parseInt(form.get('stock') as string, 10) || 0,
        currency: 'KES',
        isActive: true,
      });
      router.push(`/products/${product.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Add product</h1>
        <p className="text-zinc-500">Create a new catalog item</p>
      </div>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input name="name" placeholder="Name" required />
            <Input name="slug" placeholder="slug-url" required />
            <Input name="price" type="number" step="0.01" placeholder="Price" required />
            <Input name="stock" type="number" placeholder="Stock" defaultValue="0" />
            <Input name="description" placeholder="Description" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create product'}
              </Button>
              <Link href="/products">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@nexora/ui';
import { fetchProductById, updateProduct } from '@/lib/api';
import { ProductVariantsSection } from '@/components/product-variants-section';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await updateProduct(id, {
        name: form.get('name') as string,
        slug: form.get('slug') as string,
        description: form.get('description') as string,
        basePrice: parseFloat(form.get('price') as string),
        stockQuantity: parseInt(form.get('stock') as string, 10) || 0,
        isActive: form.get('isActive') === 'on',
      });
      router.push('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8">
        <p className="text-red-600">Product not found</p>
        <Link href="/products" className="mt-4 inline-block text-indigo-600">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Edit product</h1>
        <p className="text-zinc-500">{product.name}</p>
      </div>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input name="name" defaultValue={product.name} required />
            <Input name="slug" defaultValue={product.slug} required />
            <Input
              name="price"
              type="number"
              step="0.01"
              defaultValue={product.basePrice}
              required
            />
            <Input
              name="stock"
              type="number"
              defaultValue={product.stockQuantity}
            />
            <Input
              name="description"
              defaultValue={product.description ?? ''}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={product.isActive}
              />
              Active
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Save changes'}
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
      <ProductVariantsSection productId={id} />
    </div>
  );
}

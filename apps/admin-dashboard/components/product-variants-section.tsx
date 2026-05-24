'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@nexora/ui';
import {
  createVariant,
  deleteVariant,
  fetchProductVariants,
  fetchWarehouses,
  upsertVariantInventory,
} from '@/lib/api';

type Props = {
  productId: string;
};

export function ProductVariantsSection({ productId }: Props) {
  const queryClient = useQueryClient();
  const { data: variants = [], isLoading } = useQuery({
    queryKey: ['variants', productId],
    queryFn: () => fetchProductVariants(productId),
  });
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const sku = String(form.get('sku') ?? '').trim();
    const name = String(form.get('name') ?? '').trim();
    const price = parseFloat(String(form.get('price') ?? '0'));
    const stock = parseInt(String(form.get('stock') ?? '0'), 10) || 0;

    try {
      const variant = await createVariant({
        productId,
        sku,
        name: name || undefined,
        price,
      });
      const warehouseId = warehouses[0]?.id;
      if (warehouseId && stock > 0) {
        await upsertVariantInventory({
          variantId: variant.id,
          warehouseId,
          quantityOnHand: stock,
        });
      }
      e.currentTarget.reset();
      await queryClient.invalidateQueries({ queryKey: ['variants', productId] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add variant');
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this variant?')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteVariant(id);
      await queryClient.invalidateQueries({ queryKey: ['variants', productId] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete variant');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mt-6 max-w-lg">
      <CardHeader>
        <CardTitle>Variants &amp; stock</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading variants…</p>
        ) : variants.length === 0 ? (
          <p className="text-sm text-zinc-500">No variants yet.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {variants.map((variant) => (
              <li
                key={variant.id}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{variant.name ?? variant.sku}</p>
                  <p className="text-zinc-500">
                    {variant.sku} · {Number(variant.price).toLocaleString()} · stock{' '}
                    {variant.stockQuantity ?? 0}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => onDelete(variant.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={onAdd} className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">Add variant</p>
          <Input name="sku" placeholder="SKU" required />
          <Input name="name" placeholder="Display name" />
          <Input name="price" type="number" step="0.01" placeholder="Price" required />
          <Input name="stock" type="number" placeholder="Initial stock" defaultValue={0} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading || warehouses.length === 0}>
            {loading ? 'Adding…' : 'Add variant'}
          </Button>
          {warehouses.length === 0 && (
            <p className="text-xs text-amber-600">
              Create a warehouse in seed or inventory before adding stock.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

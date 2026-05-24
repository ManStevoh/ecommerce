'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Sparkles, Plus } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
} from '@nexora/ui';
import { deleteProduct, fetchProducts } from '@/lib/api';
import { generateProductDescription } from '@/lib/marketing-api';


export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [aiProduct, setAiProduct] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const noTenant = !process.env.NEXT_PUBLIC_TENANT_ID;

  async function handleGenerateDescription(productName: string) {
    setAiProduct(productName);
    setAiResult(null);
    setAiError(null);
    setAiLoading(true);
    try {
      const data = (await generateProductDescription(productName)) as {
        description?: string;
        content?: string;
      };
      setAiResult(data.description ?? data.content ?? JSON.stringify(data));
    } catch {
      setAiError('AI generation failed. Check OPENAI_API_KEY on ai-service.');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch {
      alert('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-page">
      <PageHeader
        title="Products"
        description="Live catalog from product service"
        action={
          <div className="flex gap-2">
            <Link href="/products/new">
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                Add product
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ['products'] })
              }
            >
              Refresh
            </Button>
          </div>
        }
      />

      {noTenant && (
        <Alert variant="warning" className="mb-6">
          <AlertDescription>
            Set NEXT_PUBLIC_TENANT_ID in .env.local
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 flex gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input placeholder="Search products…" className="pl-10" />
        </div>
      </div>

      {aiProduct && (
        <Card className="mb-6 border-indigo-200 bg-indigo-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              AI description — {aiProduct}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <p className="text-zinc-500">Generating…</p>
            ) : aiError ? (
              <p className="text-red-600">{aiError}</p>
            ) : (
              <p className="whitespace-pre-wrap text-sm text-zinc-700">
                {aiResult}
              </p>
            )}
            <Button
              variant="ghost"
              className="mt-3"
              size="sm"
              onClick={() => setAiProduct(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-zinc-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : !products?.length ? (
            <p className="text-sm text-zinc-500">No products. Run db:seed first.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>AI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>KES {product.price.toLocaleString()}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === 'active' ? 'success' : 'secondary'
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/products/${product.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          disabled={deletingId === product.id}
                          onClick={() => void handleDelete(product.id, product.name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleGenerateDescription(product.name)}
                        disabled={aiLoading}
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        Describe
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

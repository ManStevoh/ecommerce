"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, Button, Badge } from "@nexora/ui";
import { products as fallbackProducts, type Product } from "@/lib/products";
import { formatCurrency } from '@/lib/format';
import { fetchProducts as fetchApiProducts, getProductPrice } from '@/lib/api';
import { useCartStore } from "@/store/cart";
import { ShoppingBag } from "lucide-react";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=800&fit=crop";

async function fetchProducts(): Promise<Product[]> {
  const api = await fetchApiProducts(
    process.env.NEXT_PUBLIC_TENANT_ID,
  );
  if (api.length > 0) {
    return api.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description ?? "",
      price: getProductPrice(p),
      image: PLACEHOLDER_IMAGE,
      category: p.currency,
    }));
  }
  return fallbackProducts;
}

export function ProductGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  const addItem = useCartStore((s) => s.addItem);

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-96 animate-pulse rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data?.map((product) => (
        <Card key={product.id} className="group overflow-hidden transition hover:shadow-xl">
          <Link href={`/product/${product.slug}`}>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <Badge
                variant="secondary"
                className="absolute left-4 top-4 glass"
              >
                {product.category}
              </Badge>
            </div>
          </Link>
          <CardContent className="p-5">
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-medium tracking-tight hover:text-amber-600">
                {product.name}
              </h3>
            </Link>
            <p className="mt-1 text-lg font-semibold">
              {formatCurrency(product.price)}
            </p>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() =>
                addItem({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                })
              }
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

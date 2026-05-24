"use client";

import { Button } from "@nexora/ui";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";

export type CartProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
};

export function AddToCartButton({ product }: { product: CartProduct }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <Button
      variant="luxury"
      size="lg"
      className="w-full sm:w-auto"
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
      Add to Cart — {product.price.toLocaleString()}
    </Button>
  );
}

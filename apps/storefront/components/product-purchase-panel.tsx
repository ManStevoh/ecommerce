"use client";

import { useMemo, useState } from "react";
import { Button } from "@nexora/ui";
import { ShoppingCart, Check } from "lucide-react";
import {
  getVariantLabel,
  getVariantPrice,
  type ProductVariant,
} from "@/lib/api";
import { useCartStore } from "@/store/cart";

type Props = {
  productId: string;
  slug: string;
  productName: string;
  basePrice: number;
  currency: string;
  image: string;
  variants: ProductVariant[];
};

export function ProductPurchasePanel({
  productId,
  slug,
  productName,
  basePrice,
  currency,
  image,
  variants,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const inStockVariants = useMemo(
    () =>
      variants.filter(
        (variant) =>
          (variant.stockQuantity ?? 0) > 0 ||
          variant.stockQuantity === undefined,
      ),
    [variants],
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    inStockVariants[0]?.id ?? variants[0]?.id ?? null,
  );

  const selected = useMemo(
    () => variants.find((v) => v.id === selectedId) ?? null,
    [variants, selectedId],
  );

  const price = selected ? getVariantPrice(selected) : basePrice;
  const displayName = selected
    ? `${productName} (${getVariantLabel(selected)})`
    : productName;
  const selectedStock = selected?.stockQuantity;
  const outOfStock =
    variants.length > 0 &&
    selectedStock !== undefined &&
    selectedStock <= 0;

  const handleAdd = () => {
    addItem({
      productId,
      variantId: selected?.id,
      slug,
      name: displayName,
      price,
      image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Price */}
      <p className="text-3xl font-bold text-theme-accent">
        {currency} {price.toLocaleString()}
      </p>

      {/* Stock indicator */}
      {selectedStock !== undefined && (
        <p className="text-sm">
          {outOfStock ? (
            <span className="inline-flex items-center gap-1.5 text-red-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Out of stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {selectedStock} in stock
            </span>
          )}
        </p>
      )}

      {/* Variant selector */}
      {variants.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Choose option
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const stock = variant.stockQuantity;
              const unavailable = stock !== undefined && stock <= 0;
              const isSelected = selectedId === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={unavailable}
                  onClick={() => setSelectedId(variant.id)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "border-theme-accent bg-theme-accent text-white shadow-md"
                      : unavailable
                        ? "cursor-not-allowed border-zinc-100 text-zinc-300 dark:border-zinc-800 dark:text-zinc-600"
                        : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:hover:border-zinc-600"
                  }`}
                >
                  {getVariantLabel(variant)} — {currency}{" "}
                  {getVariantPrice(variant).toLocaleString()}
                  {stock !== undefined ? ` (${stock} left)` : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add to cart button */}
      <Button
        variant="luxury"
        size="lg"
        className="w-full rounded-xl text-base sm:w-auto"
        disabled={(variants.length > 0 && !selected) || outOfStock}
        onClick={handleAdd}
      >
        {added ? (
          <>
            <Check className="h-4 w-4" />
            Added to Cart!
          </>
        ) : outOfStock ? (
          "Out of stock"
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Add to Cart — {currency} {price.toLocaleString()}
          </>
        )}
      </Button>
    </div>
  );
}

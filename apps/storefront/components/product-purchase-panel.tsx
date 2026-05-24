"use client";



import { useMemo, useState } from "react";

import { Button } from "@nexora/ui";

import { ShoppingBag } from "lucide-react";

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

  const inStockVariants = useMemo(

    () =>

      variants.filter(

        (variant) => (variant.stockQuantity ?? 0) > 0 || variant.stockQuantity === undefined,

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



  return (

    <div className="space-y-4">

      {variants.length > 0 && (

        <div>

          <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">

            Choose option

          </p>

          <div className="flex flex-wrap gap-2">

            {variants.map((variant) => {

              const stock = variant.stockQuantity;

              const unavailable = stock !== undefined && stock <= 0;

              return (

                <button

                  key={variant.id}

                  type="button"

                  disabled={unavailable}

                  onClick={() => setSelectedId(variant.id)}

                  className={`rounded-full border px-4 py-2 text-sm transition ${

                    selectedId === variant.id

                      ? "border-theme-accent bg-theme-accent text-white"

                      : unavailable

                        ? "cursor-not-allowed border-zinc-100 text-zinc-400 dark:border-zinc-800"

                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700"

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



      <p className="text-2xl font-light text-theme-accent">

        {currency} {price.toLocaleString()}

      </p>



      {selectedStock !== undefined && (

        <p className="text-sm text-zinc-500">

          {outOfStock ? "Out of stock" : `${selectedStock} in stock`}

        </p>

      )}



      <Button

        variant="luxury"

        size="lg"

        className="w-full sm:w-auto"

        disabled={(variants.length > 0 && !selected) || outOfStock}

        onClick={() =>

          addItem({

            productId,

            variantId: selected?.id,

            slug,

            name: displayName,

            price,

            image,

          })

        }

      >

        <ShoppingBag className="h-4 w-4" />

        {outOfStock ? "Out of stock" : `Add to Cart — ${price.toLocaleString()}`}

      </Button>

    </div>

  );

}


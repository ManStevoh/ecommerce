"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Card, CardContent, EmptyState } from "@nexora/ui";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useCartStore, useCartTotal } from "@/store/cart";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartTotal();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Discover our curated collection"
        action={
          <Link href="/">
            <Button variant="luxury">Continue Shopping</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex gap-4 p-4">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-medium hover:text-amber-600"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-zinc-500">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="h-fit glass-card">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block">
              <Button variant="luxury" className="w-full">
                Proceed to Checkout
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Card, CardContent, EmptyState } from "@nexora/ui";
import { Minus, Plus, Trash2, ShoppingCart, Truck, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useCartStore, useCartTotal } from "@/store/cart";
import { ScrollAnimator } from "@/components/scroll-animator";

const FREE_SHIPPING_THRESHOLD = 100;

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartTotal();

  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - total;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <EmptyState
          title="Your cart is empty"
          description="Discover our curated collection and find something you love."
          action={
            <Link href="/">
              <Button variant="luxury" className="gap-2 rounded-xl">
                <ShoppingCart className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {items.length} {items.length === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="space-y-3 lg:col-span-2">
          {items.map((item, i) => (
            <ScrollAnimator key={item.lineKey} delay={i * 0.05}>
              <Card className="overflow-hidden border-zinc-200/40 transition-all duration-300 hover:shadow-md dark:border-zinc-800/40">
                <CardContent className="flex gap-4 p-4">
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-medium tracking-tight transition-colors hover:text-theme-accent"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-sm text-zinc-500">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-3 sm:mt-0">
                      <div className="flex items-center gap-0.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-l-xl"
                          onClick={() =>
                            updateQuantity(item.lineKey, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-r-xl"
                          onClick={() =>
                            updateQuantity(item.lineKey, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="min-w-[4.5rem] text-right text-sm font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-red-500"
                        onClick={() => removeItem(item.lineKey)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollAnimator>
          ))}
        </div>

        {/* Order summary */}
        <div className="h-fit lg:sticky lg:top-28">
          <Card className="overflow-hidden border-zinc-200/30 shadow-xl dark:border-zinc-800/30">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              {/* Free shipping progress */}
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-theme-accent" />
                  {remaining > 0 ? (
                    <span>
                      <span className="font-medium">{formatCurrency(remaining)}</span>{" "}
                      away from free shipping
                    </span>
                  ) : (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      You qualify for free shipping! 🎉
                    </span>
                  )}
                </div>
                <div className="progress-bar mt-2">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Shipping</span>
                  <span className="font-medium">
                    {remaining > 0 ? "Calculated at checkout" : "Free"}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button variant="luxury" className="w-full gap-2 rounded-xl text-base">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link
                href="/"
                className="block text-center text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Continue Shopping
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  lineKey: string;
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export function cartLineKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}:${variantId}` : productId;
}

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "lineKey">, quantity?: number) => void;
  removeItem: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const lineKey = cartLineKey(item.productId, item.variantId);
        const existing = get().items.find((i) => i.lineKey === lineKey);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.lineKey === lineKey
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({
            items: [...get().items, { ...item, lineKey, quantity }],
          });
        }
      },
      removeItem: (lineKey) =>
        set({ items: get().items.filter((i) => i.lineKey !== lineKey) }),
      updateQuantity: (lineKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineKey);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.lineKey === lineKey ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "nexora-cart",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as { items?: Array<Record<string, unknown>> };
        if (!state?.items) return state as CartState;
        return {
          items: state.items.map((item) => {
            const productId = String(item.productId ?? item.id ?? "");
            const variantId = item.variantId
              ? String(item.variantId)
              : undefined;
            const lineKey = String(
              item.lineKey ?? cartLineKey(productId, variantId),
            );
            return {
              lineKey,
              productId,
              variantId,
              slug: String(item.slug ?? ""),
              name: String(item.name ?? ""),
              price: Number(item.price ?? 0),
              quantity: Number(item.quantity ?? 1),
              image: String(item.image ?? ""),
            };
          }),
        } as CartState;
      },
    }
  )
);

export function useCartTotal() {
  return useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  );
}

export function useCartCount() {
  return useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
}

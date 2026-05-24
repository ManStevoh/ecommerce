import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAccessToken } from '@/lib/auth';
import {
  addToWishlist,
  fetchWishlist,
  getProductImage,
  getProductPrice,
  removeFromWishlist,
  type ApiProduct,
} from '@/lib/api';

export type WishlistEntry = {
  productId: string;
  slug?: string;
  name?: string;
  price?: number;
  image?: string;
};

type WishlistState = {
  items: WishlistEntry[];
  add: (entry: WishlistEntry, tenantId: string) => Promise<void>;
  remove: (productId: string, tenantId: string) => Promise<void>;
  syncFromApi: (tenantId: string) => Promise<void>;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: async (entry, tenantId) => {
        if (getAccessToken()) {
          await addToWishlist(tenantId, entry.productId);
        }
        const exists = get().items.some((i) => i.productId === entry.productId);
        if (!exists) {
          set({ items: [...get().items, entry] });
        }
      },
      remove: async (productId, tenantId) => {
        if (getAccessToken()) {
          await removeFromWishlist(tenantId, productId);
        }
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      syncFromApi: async (tenantId) => {
        if (!getAccessToken()) return;
        const remote = await fetchWishlist(tenantId);
        const items = remote.map((w) => {
          const p = w.product as ApiProduct | undefined;
          return {
            productId: w.productId,
            slug: p?.slug,
            name: p?.name,
            price: p ? getProductPrice(p) : undefined,
            image: p ? getProductImage(p) : undefined,
          };
        });
        set({ items });
      },
    }),
    { name: 'nexora-wishlist' },
  ),
);
export function useWishlistCount() {
  return useWishlistStore((s) => s.items.length);
}

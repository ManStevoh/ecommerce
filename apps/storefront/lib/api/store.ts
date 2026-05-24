import { API_URL, tenantHeaders } from './client';

export type StoreSettings = {
  currency: string;
  taxEnabled: boolean;
  taxRate: number;
  shippingEnabled: boolean;
};

export const DEFAULT_SHIPPING_FEE = 350;

export async function fetchStoreSettings(
  tenantId: string,
): Promise<StoreSettings | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/store-settings`, {
      headers: tenantHeaders(tenantId),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as StoreSettings;
    return data;
  } catch {
    return null;
  }
}

export function computeCheckoutTotals(
  subtotal: number,
  settings: StoreSettings | null,
  discountAmount = 0,
) {
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxEnabled = settings?.taxEnabled ?? false;
  const taxRate = settings?.taxRate ?? 0;
  const shippingEnabled = settings?.shippingEnabled ?? true;
  const taxAmount = taxEnabled ? (afterDiscount * taxRate) / 100 : 0;
  const shippingAmount = shippingEnabled ? DEFAULT_SHIPPING_FEE : 0;
  const total = afterDiscount + taxAmount + shippingAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount: Math.round(taxAmount * 100) / 100,
    shippingAmount,
    total: Math.round(total * 100) / 100,
  };
}

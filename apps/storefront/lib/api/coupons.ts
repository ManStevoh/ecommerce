import { API_URL, tenantHeaders } from './client';

export type CouponValidation = {
  valid: boolean;
  code: string;
  type: string;
  discountAmount: number;
};

export async function validateCoupon(
  tenantId: string,
  code: string,
  subtotal: number,
): Promise<CouponValidation> {
  const res = await fetch(`${API_URL}/api/v1/coupons/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...tenantHeaders(tenantId),
    },
    body: JSON.stringify({ code: code.trim(), subtotal }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Invalid coupon code',
    );
  }
  return res.json() as Promise<CouponValidation>;
}

export async function redeemCoupon(
  tenantId: string,
  code: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/coupons/redeem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...tenantHeaders(tenantId),
    },
    body: JSON.stringify({ code: code.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Could not apply coupon',
    );
  }
}

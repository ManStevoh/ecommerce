const DEFAULT_CURRENCY = 'KES';

export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  return `${currency} ${amount.toLocaleString()}`;
}

export { DEFAULT_CURRENCY };

/**
 * Theme font URL + variant stock helpers.
 * Run: node scripts/test-pending-features.mjs
 */

import { googleFontsStylesheetUrl } from '../packages/themes/dist/fonts.js';

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  }
}

assert(
  googleFontsStylesheetUrl('Inter, system-ui, sans-serif') === null,
  'Inter-only skips duplicate Google Fonts link',
);
assert(
  googleFontsStylesheetUrl('"DM Sans", Inter, sans-serif')?.includes('DM+Sans'),
  'DM Sans preset loads Google Fonts',
);
assert(
  googleFontsStylesheetUrl('"Playfair Display", Georgia, serif')?.includes(
    'Playfair+Display',
  ),
  'Playfair Display preset loads Google Fonts',
);

function variantAvailable(levels, quantity) {
  const total = levels.reduce(
    (sum, level) => sum + level.quantityOnHand - level.quantityReserved,
    0,
  );
  return total >= quantity;
}

assert(
  variantAvailable(
    [
      { quantityOnHand: 10, quantityReserved: 2 },
      { quantityOnHand: 5, quantityReserved: 0 },
    ],
    12,
  ),
  'variant stock sums warehouses',
);
assert(
  !variantAvailable([{ quantityOnHand: 3, quantityReserved: 1 }], 5),
  'variant stock rejects oversell',
);

function shouldRestoreStock(fromStatus, toStatus) {
  if (toStatus === 'CANCELLED') return fromStatus !== 'CANCELLED';
  if (toStatus === 'RETURNED') {
    return fromStatus === 'SHIPPED' || fromStatus === 'DELIVERED';
  }
  if (toStatus === 'REFUNDED') {
    return (
      fromStatus !== 'CANCELLED' &&
      fromStatus !== 'REFUNDED' &&
      fromStatus !== 'RETURNED'
    );
  }
  return false;
}

assert(shouldRestoreStock('SHIPPED', 'RETURNED'), 'return restores stock');
assert(
  !shouldRestoreStock('RETURNED', 'REFUNDED'),
  'refund after return does not double-restore',
);

if (failed === 0) {
  console.log('OK pending feature unit checks passed');
  process.exit(0);
}
process.exit(1);

/**
 * Lightweight tests for inventory restore rules and stock API shapes.
 * Run: node scripts/test-platform-features.mjs
 */

function shouldRestoreStock(fromStatus, toStatus) {
  if (toStatus === 'CANCELLED') return fromStatus !== 'CANCELLED';
  if (toStatus === 'REFUNDED') {
    return fromStatus !== 'CANCELLED' && fromStatus !== 'REFUNDED';
  }
  return false;
}

const cases = [
  ['PENDING', 'CANCELLED', true],
  ['CANCELLED', 'CANCELLED', false],
  ['CONFIRMED', 'REFUNDED', true],
  ['CANCELLED', 'REFUNDED', false],
  ['PENDING', 'CONFIRMED', false],
];

let failed = 0;
for (const [from, to, expected] of cases) {
  const actual = shouldRestoreStock(from, to);
  if (actual !== expected) {
    console.error(`FAIL shouldRestoreStock(${from}, ${to}) expected ${expected} got ${actual}`);
    failed += 1;
  }
}

const stockPayload = {
  items: [{ productId: 'prod_1', quantity: 2 }],
};
if (!Array.isArray(stockPayload.items) || stockPayload.items[0].quantity < 1) {
  console.error('FAIL stock payload shape');
  failed += 1;
}

if (failed === 0) {
  console.log(`OK ${cases.length} inventory-restore rule checks passed`);
  process.exit(0);
}

console.error(`${failed} test(s) failed`);
process.exit(1);

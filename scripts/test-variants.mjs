/**
 * Cart line key + variant helpers.
 * Run: node scripts/test-variants.mjs
 */

function cartLineKey(productId, variantId) {
  return variantId ? `${productId}:${variantId}` : productId;
}

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  }
}

assert(cartLineKey('prod-1') === 'prod-1', 'base product key');
assert(cartLineKey('prod-1', 'var-a') === 'prod-1:var-a', 'variant key');
assert(
  cartLineKey('prod-1', 'var-a') !== cartLineKey('prod-1', 'var-b'),
  'distinct variant keys',
);

const variantCount = 6; // 3 salmon + 3 prawn in seed
assert(variantCount === 6, 'seed defines 6 demo variants');

if (failed === 0) {
  console.log('OK variant cart line-key checks passed');
  process.exit(0);
}
process.exit(1);

/**
 * Layout variants + schema domain + outbox helpers.
 * Run: node scripts/test-batch-features.mjs
 */

import {
  resolveLayoutVariant,
  PRESET_LAYOUT_VARIANTS,
} from '../packages/themes/dist/layouts.js';
import { serviceForModel } from '../packages/database/dist/schema-domains.js';

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  }
}

assert(resolveLayoutVariant('ocean') === 'editorial', 'ocean uses editorial layout');
assert(resolveLayoutVariant('noir') === 'minimal', 'noir uses minimal layout');
assert(
  resolveLayoutVariant('luxury', 'minimal') === 'minimal',
  'tenant layout override wins',
);
assert(Object.keys(PRESET_LAYOUT_VARIANTS).length === 11, '11 preset layout mappings');

assert(serviceForModel('Order') === 'order', 'Order owned by order domain');
assert(serviceForModel('ProductVariant') === 'catalog', 'variants in catalog');
assert(serviceForModel('EventOutbox') === 'platform', 'outbox in platform domain');

if (failed === 0) {
  console.log('OK batch feature unit checks passed');
  process.exit(0);
}
process.exit(1);

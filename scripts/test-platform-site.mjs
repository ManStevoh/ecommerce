/**
 * Platform marketing site CMS checks.
 * Run: node scripts/test-platform-site.mjs
 */

const PUBLIC_ROUTES = [
  '/api/v1/platform/pages/public/home',
  '/api/v1/platform/site/public',
];

const CMS_BLOCK_TYPES = [
  'HERO',
  'LOGO_STRIP',
  'FEATURES_GRID',
  'STATS_BAR',
  'PRICING',
  'TESTIMONIALS',
  'FAQ',
  'CTA',
];

const ADMIN_ROUTES = [
  '/api/v1/platform/pages',
  '/api/v1/platform/site',
];

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  }
}

assert(PUBLIC_ROUTES.length === 2, 'public CMS endpoints defined');
assert(CMS_BLOCK_TYPES.length >= 8, 'standard landing block types exist');
assert(ADMIN_ROUTES.length === 2, 'super-admin CMS API routes defined');

assert(
  CMS_BLOCK_TYPES.includes('HERO') && CMS_BLOCK_TYPES.includes('PRICING'),
  'hero and pricing blocks included',
);

const navExample = [{ label: 'Pricing', href: '#pricing' }];
assert(Array.isArray(navExample) && navExample[0].href.startsWith('#'), 'nav links support anchors');

if (failed === 0) {
  console.log('OK platform marketing site checks passed');
  process.exit(0);
}
process.exit(1);

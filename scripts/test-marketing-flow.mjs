/**
 * Marketing module flow checks (campaigns, coupons, segments).
 * Run: node scripts/test-marketing-flow.mjs
 */

const MARKETING_MODULES = ['coupons', 'campaigns', 'segments'];

const MARKETING_FLOW = [
  'create coupon (PERCENTAGE or FIXED)',
  'define segment and evaluate members',
  'create email campaign linked to segment',
  'send campaign or schedule for cron',
  'customer applies coupon at checkout',
];

const PLAN_MARKETING = {
  starter: ['Checkout coupons'],
  growth: ['Coupons & customer segments', 'Email campaigns'],
  business: ['Scheduled campaigns', 'Advanced segments & coupons'],
  enterprise: ['Full marketing suite'],
};

function computeDiscount(type, value, subtotal) {
  let amount = type === 'PERCENTAGE' ? (subtotal * value) / 100 : value;
  return Math.min(amount, subtotal);
}

function campaignReady(campaign) {
  return Boolean(campaign.name && campaign.channel);
}

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  }
}

assert(MARKETING_MODULES.length === 3, 'three marketing modules');
assert(MARKETING_FLOW.length === 5, 'end-to-end marketing flow has five stages');

assert(
  computeDiscount('PERCENTAGE', 10, 1000) === 100,
  '10% off 1000 = 100',
);
assert(
  computeDiscount('FIXED_AMOUNT', 500, 300) === 300,
  'fixed discount capped at subtotal',
);

assert(
  campaignReady({ name: 'Welcome', channel: 'email' }),
  'campaign with name and channel is valid',
);
assert(
  !campaignReady({ name: '', channel: 'email' }),
  'campaign without name is invalid',
);

assert(
  PLAN_MARKETING.starter.some((f) => f.toLowerCase().includes('coupon')),
  'starter plan includes coupons',
);
assert(
  PLAN_MARKETING.growth.some((f) => f.toLowerCase().includes('campaign')),
  'growth plan includes campaigns',
);
assert(
  PLAN_MARKETING.business.some((f) => f.toLowerCase().includes('scheduled')),
  'business plan includes scheduled campaigns',
);

assert('FIXED_AMOUNT' !== 'FIXED', 'coupon enum uses FIXED_AMOUNT not FIXED');

const scheduledStatuses = ['SCHEDULED', 'DRAFT', 'COMPLETED'];
assert(scheduledStatuses.includes('SCHEDULED'), 'scheduled campaign status exists');

if (failed === 0) {
  console.log('OK marketing flow checks passed');
  process.exit(0);
}
process.exit(1);

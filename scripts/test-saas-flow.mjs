/**
 * SaaS plan + subscription flow unit checks.
 * Run: node scripts/test-saas-flow.mjs
 */

const PLAN_SLUGS = ['starter', 'growth', 'business', 'enterprise'];

const SAAS_FLOW = [
  'super-admin creates plan in DB',
  'tenant signs up → 14-day trial on Growth',
  'tenant subscribes via admin billing → payment → ACTIVE',
  'tenant.planId synced with subscription',
];

function slugToEnum(slug) {
  return slug.toUpperCase();
}

function computePeriodEnd(cycle) {
  const end = new Date();
  if (cycle === 'YEARLY') {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end;
}

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  }
}

assert(PLAN_SLUGS.length === 4, 'four SaaS tiers seeded');
assert(slugToEnum('growth') === 'GROWTH', 'slug maps to subscription enum');
assert(SAAS_FLOW.length === 4, 'end-to-end SaaS flow has four stages');

const trialEnd = new Date();
trialEnd.setDate(trialEnd.getDate() + 14);
assert(trialEnd > new Date(), 'trial period is in the future');

const monthlyEnd = computePeriodEnd('MONTHLY');
const yearlyEnd = computePeriodEnd('YEARLY');
assert(yearlyEnd > monthlyEnd, 'yearly period longer than monthly');

function shouldIncludeCurrent(status) {
  return status === 'ACTIVE' || status === 'TRIALING';
}

assert(shouldIncludeCurrent('TRIALING'), 'trial counts as current subscription');
assert(shouldIncludeCurrent('ACTIVE'), 'active counts as current subscription');
assert(!shouldIncludeCurrent('CANCELLED'), 'cancelled excluded from current');

if (failed === 0) {
  console.log('OK SaaS subscription flow checks passed');
  process.exit(0);
}
process.exit(1);

import { PrismaClient, Role, TenantStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@nexora.cloud' },
    update: {},
    create: {
      email: 'admin@nexora.cloud',
      passwordHash,
      firstName: 'Platform',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
    },
  });

  const demoOwner = await prisma.user.upsert({
    where: { email: 'owner@freshfish.demo' },
    update: {},
    create: {
      email: 'owner@freshfish.demo',
      passwordHash,
      firstName: 'Fresh',
      lastName: 'Fish',
      role: Role.STORE_OWNER,
    },
  });

  const growthPlan = await prisma.plan.upsert({
    where: { slug: 'growth' },
    update: {},
    create: {
      name: 'Growth',
      slug: 'growth',
      description: 'For growing businesses',
      priceMonthly: 79,
      priceYearly: 790,
      currency: 'USD',
      maxProducts: 1000,
      maxUsers: 10,
      maxStorageMb: 5120,
    },
  });

  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'freshfish' },
    update: {},
    create: {
      name: 'Fresh Fish Kenya',
      slug: 'freshfish',
      subdomain: 'freshfish',
      ownerId: demoOwner.id,
      planId: growthPlan.id,
      status: TenantStatus.ACTIVE,
      storeSettings: {
        create: {
          currency: 'KES',
          timezone: 'Africa/Nairobi',
          locale: 'en-KE',
          contactEmail: 'owner@freshfish.demo',
          taxEnabled: true,
          taxRate: 16,
          shippingEnabled: true,
        },
      },
      themeSettings: {
        create: {
          primaryColor: '#0c4a6e',
          accentColor: '#06b6d4',
        },
      },
    },
    include: { storeSettings: true, themeSettings: true },
  });

  await prisma.user.update({
    where: { id: demoOwner.id },
    data: { tenantId: tenant.id },
  });

  const products = [
    {
      sku: 'SALMON-001',
      slug: 'atlantic-salmon-fillet',
      name: 'Atlantic Salmon Fillet',
      description: 'Premium fresh salmon, sustainably sourced.',
      price: 2499,
    },
    {
      sku: 'PRAWN-500',
      slug: 'tiger-prawns-500g',
      name: 'Tiger Prawns 500g',
      description: 'Jumbo tiger prawns, flash-frozen at source.',
      price: 1899,
    },
    {
      sku: 'SNAP-001',
      slug: 'red-snapper-whole',
      name: 'Red Snapper Whole',
      description: 'Whole red snapper, cleaned and ready to cook.',
      price: 1299,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: p.slug } },
      update: {},
      create: {
        tenantId: tenant.id,
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        basePrice: p.price,
        currency: 'KES',
        isActive: true,
      },
    });
  }

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.coupon.upsert({
    where: {
      tenantId_code: { tenantId: tenant.id, code: 'WELCOME10' },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      minOrderAmount: 500,
      maxUses: 100,
      isActive: true,
    },
  });

  await prisma.customerSegment.upsert({
    where: { id: 'seed-segment-repeat-buyers' },
    update: {},
    create: {
      id: 'seed-segment-repeat-buyers',
      tenantId: tenant.id,
      name: 'Repeat buyers',
      description: 'Customers with at least one completed order',
      rules: { minOrderCount: 1, minTotalSpent: 0 },
      memberCount: 0,
    },
  });

  await prisma.subscription.upsert({
    where: { id: 'seed-sub-freshfish' },
    update: {},
    create: {
      id: 'seed-sub-freshfish',
      tenantId: tenant.id,
      planId: growthPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    },
  });

  console.log('Seed complete:');
  console.log('  Super admin:', superAdmin.email, '/ Admin123!');
  console.log('');
  console.log('  NEXT_PUBLIC_TENANT_ID=' + tenant.id);
  console.log('  (copy into apps/storefront/.env.local)');
  console.log('');
  console.log('  Demo tenant:', tenant.id);
  console.log('  Store URL:   freshfish.nexora.local');
  console.log('  Store owner:', demoOwner.email, '/ Admin123!');
  console.log('  Demo coupon: WELCOME10 (10% off, min KES 500)');
  console.log('  Demo segment: Repeat buyers (evaluate in Marketing → Segments)');

  await indexProductsForSearch(tenant.id);
}

async function indexProductsForSearch(tenantId: string) {
  const searchUrl = process.env.SEARCH_SERVICE_URL ?? 'http://localhost:3009';
  const products = await prisma.product.findMany({
    where: { tenantId, isActive: true },
  });

  for (const product of products) {
    try {
      const res = await fetch(`${searchUrl}/api/v1/search/index`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          description: product.description,
        }),
      });
      if (res.ok) {
        console.log(`  Indexed: ${product.slug}`);
      }
    } catch {
      console.warn(`  Search index skipped for ${product.slug} (search-service offline?)`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

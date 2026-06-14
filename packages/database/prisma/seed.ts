import { PrismaClient, Role, TenantStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedPlan(plan: {
  slug: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxProducts: number;
  maxUsers: number;
  maxStorageMb: number;
  features: string[];
}) {
  return prisma.plan.upsert({
    where: { slug: plan.slug },
    update: {
      name: plan.name,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      maxProducts: plan.maxProducts,
      maxUsers: plan.maxUsers,
      maxStorageMb: plan.maxStorageMb,
      features: plan.features,
    },
    create: {
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      currency: 'USD',
      maxProducts: plan.maxProducts,
      maxUsers: plan.maxUsers,
      maxStorageMb: plan.maxStorageMb,
      features: plan.features,
    },
  });
}

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

  const growthPlan = await seedPlan({
    slug: 'growth',
    name: 'Growth',
    description: 'For growing businesses',
    priceMonthly: 79,
    priceYearly: 790,
    maxProducts: 1000,
    maxUsers: 10,
    maxStorageMb: 5120,
    features: [
      'Up to 1,000 products',
      'Coupons & customer segments',
      'Email campaigns',
      'Advanced analytics',
      'Priority support',
    ],
  });

  await seedPlan({
    slug: 'starter',
    name: 'Starter',
    description: 'For new merchants getting started',
    priceMonthly: 29,
    priceYearly: 290,
    maxProducts: 100,
    maxUsers: 2,
    maxStorageMb: 1024,
    features: [
      'Up to 100 products',
      'Checkout coupons',
      'Basic analytics',
      'Email support',
    ],
  });

  await seedPlan({
    slug: 'business',
    name: 'Business',
    description: 'For established brands',
    priceMonthly: 199,
    priceYearly: 1990,
    maxProducts: 999999,
    maxUsers: 50,
    maxStorageMb: 20480,
    features: [
      'Unlimited products',
      'Scheduled campaigns',
      'Advanced segments & coupons',
      'AI insights',
      'Dedicated support',
    ],
  });

  await seedPlan({
    slug: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    priceMonthly: 0,
    priceYearly: 0,
    maxProducts: 999999,
    maxUsers: 999999,
    maxStorageMb: 102400,
    features: [
      'Full marketing suite',
      'Custom SLA',
      'SSO',
      'Dedicated infrastructure',
    ],
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
          themePreset: 'ocean',
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

  const warehouse = await prisma.warehouse.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'MAIN' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Main warehouse',
      code: 'MAIN',
    },
  });

  async function seedVariantInventory(
    sku: string,
    quantityOnHand: number,
  ) {
    const variant = await prisma.productVariant.findFirst({
      where: { tenantId: tenant.id, sku },
    });
    if (!variant) return;

    await prisma.inventoryLevel.upsert({
      where: {
        tenantId_variantId_warehouseId: {
          tenantId: tenant.id,
          variantId: variant.id,
          warehouseId: warehouse.id,
        },
      },
      update: { quantityOnHand },
      create: {
        tenantId: tenant.id,
        variantId: variant.id,
        warehouseId: warehouse.id,
        quantityOnHand,
      },
    });
  }

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
        stockQuantity: 50,
      },
    });
  }

  const salmon = await prisma.product.findFirst({
    where: { tenantId: tenant.id, slug: 'atlantic-salmon-fillet' },
  });
  if (salmon) {
    const salmonVariants = [
      { sku: 'SALMON-S', name: 'Small (300g)', price: 1999, size: 'Small' },
      { sku: 'SALMON-M', name: 'Medium (500g)', price: 2499, size: 'Medium' },
      { sku: 'SALMON-L', name: 'Large (1kg)', price: 4499, size: 'Large' },
    ];
    for (const v of salmonVariants) {
      await prisma.productVariant.upsert({
        where: { tenantId_sku: { tenantId: tenant.id, sku: v.sku } },
        update: {},
        create: {
          tenantId: tenant.id,
          productId: salmon.id,
          sku: v.sku,
          name: v.name,
          price: v.price,
          attributeValues: { size: v.size },
        },
      });
    }
  }

  const prawns = await prisma.product.findFirst({
    where: { tenantId: tenant.id, slug: 'tiger-prawns-500g' },
  });
  if (prawns) {
    const prawnVariants = [
      { sku: 'PRAWN-250', name: '250g pack', price: 999 },
      { sku: 'PRAWN-500', name: '500g pack', price: 1899 },
      { sku: 'PRAWN-1KG', name: '1kg family pack', price: 3499 },
    ];
    for (const v of prawnVariants) {
      await prisma.productVariant.upsert({
        where: { tenantId_sku: { tenantId: tenant.id, sku: v.sku } },
        update: {},
        create: {
          tenantId: tenant.id,
          productId: prawns.id,
          sku: v.sku,
          name: v.name,
          price: v.price,
          attributeValues: { pack: v.name },
        },
      });
    }
  }

  const variantStock: Record<string, number> = {
    'SALMON-S': 25,
    'SALMON-M': 40,
    'SALMON-L': 15,
    'PRAWN-250': 30,
    'PRAWN-500': 50,
    'PRAWN-1KG': 20,
  };
  for (const [sku, qty] of Object.entries(variantStock)) {
    await seedVariantInventory(sku, qty);
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

  await prisma.campaign.upsert({
    where: { id: 'seed-campaign-welcome' },
    update: {},
    create: {
      id: 'seed-campaign-welcome',
      tenantId: tenant.id,
      name: 'Welcome back offer',
      description: 'Email repeat buyers with a thank-you message',
      status: 'DRAFT',
      channel: 'email',
      segmentId: 'seed-segment-repeat-buyers',
      metadata: {
        subject: 'Thanks for shopping with Fresh Fish!',
        body: 'Enjoy 10% off your next order with code WELCOME10.',
      },
    },
  });

  await prisma.campaign.upsert({
    where: { id: 'seed-campaign-scheduled' },
    update: {},
    create: {
      id: 'seed-campaign-scheduled',
      tenantId: tenant.id,
      name: 'Weekend flash sale',
      description: 'Scheduled promo for repeat buyers',
      status: 'SCHEDULED',
      channel: 'email',
      segmentId: 'seed-segment-repeat-buyers',
      startsAt: new Date(Date.now() - 60_000),
      metadata: {
        subject: 'Weekend specials at Fresh Fish!',
        body: 'Fresh catch this weekend — use WELCOME10 for 10% off.',
      },
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

  await seedPlatformMarketingSite();

  console.log('Seed complete:');
  console.log('  Super admin:', superAdmin.email, '/ Admin123!');
  console.log('');
  console.log('  NEXT_PUBLIC_TENANT_ID=' + tenant.id);
  console.log('  (copy into apps/storefront/.env.local)');
  console.log('');
  console.log('  SaaS plans: starter, growth, business, enterprise (super-admin → Plans)');
  console.log('  Store billing: Admin → Settings → Billing (subscribe / cancel)');
  console.log('  Store URL:   freshfish.nexora.local');
  console.log('  Store owner:', demoOwner.email, '/ Admin123!');
  console.log('  Demo coupon: WELCOME10 (10% off, min KES 500)');
  console.log('  Demo segment: Repeat buyers (evaluate in Marketing → Segments)');
  console.log('  Demo campaign: Welcome back offer (Marketing → Campaigns → Send now)');
  console.log('  Scheduled campaign: Weekend flash sale (auto-sends via cron)');
  console.log('  Product variants: Salmon (3 sizes), Prawns (3 packs) with per-variant stock');
  console.log('  Platform site: http://localhost:3400 (Super Admin → Marketing site)');

  await indexProductsForSearch(tenant.id);
}

async function seedPlatformMarketingSite() {
  await prisma.platformSiteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Nexora',
      tagline: 'Commerce platform for modern brands',
      primaryCtaLabel: 'Start free trial',
      primaryCtaHref: 'http://localhost:3200/login',
      navLinks: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
      ],
      footerColumns: [
        {
          title: 'Product',
          links: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '#contact' },
          ],
        },
        {
          title: 'Legal',
          links: [
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ],
        },
      ],
      footerNote: '© 2026 Nexora Commerce. All rights reserved.',
    },
  });

  const homepageBlocks = [
    {
      type: 'HERO' as const,
      sortOrder: 0,
      config: {
        eyebrow: 'Multi-tenant commerce platform',
        headline: 'Launch and scale your online store',
        subheadline:
          'Catalog, orders, payments, marketing, and analytics in one SaaS platform built for retailers and brands.',
        primaryLabel: 'Start free trial',
        primaryHref: 'http://localhost:3200/login',
        secondaryLabel: 'View pricing',
        secondaryHref: '#pricing',
      },
    },
    {
      type: 'LOGO_STRIP' as const,
      sortOrder: 1,
      config: {
        title: 'Trusted by growing merchants',
        logos: ['Fresh Fish Kenya', 'Urban Apparel', 'GreenGrocer', 'Artisan Co.'],
      },
    },
    {
      type: 'FEATURES_GRID' as const,
      sortOrder: 2,
      config: {
        title: 'Everything you need to sell online',
        subtitle: 'Standard commerce capabilities out of the box.',
        items: [
          {
            title: 'Product catalog',
            description: 'Manage products, variants, inventory, and categories.',
          },
          {
            title: 'Orders & fulfillment',
            description: 'Track orders from checkout through delivery and returns.',
          },
          {
            title: 'Payments',
            description: 'Accept card and mobile money with configurable gateways.',
          },
          {
            title: 'Marketing',
            description: 'Coupons, segments, and email campaigns for your store.',
          },
          {
            title: 'Analytics',
            description: 'Sales dashboards and reporting for store owners.',
          },
          {
            title: 'Multi-tenant SaaS',
            description: 'Subscription plans, trials, and billing built in.',
          },
        ],
      },
    },
    {
      type: 'STATS_BAR' as const,
      sortOrder: 3,
      config: {
        items: [
          { value: '99.9%', label: 'Platform uptime SLA' },
          { value: '15+', label: 'Integrated services' },
          { value: '4', label: 'Subscription tiers' },
          { value: '24/7', label: 'Support on Business+' },
        ],
      },
    },
    {
      type: 'PRICING' as const,
      sortOrder: 4,
      config: {
        title: 'Simple, transparent pricing',
        subtitle: 'Start on a trial. Upgrade when you are ready to scale.',
      },
    },
    {
      type: 'TESTIMONIALS' as const,
      sortOrder: 5,
      config: {
        title: 'Built for operators',
        items: [
          {
            quote:
              'We moved our fish delivery store to Nexora in a week. Orders, stock, and payments just work.',
            author: 'Fresh Fish Kenya',
            role: 'Store owner',
          },
          {
            quote:
              'The admin dashboard and marketing tools saved us from juggling five different systems.',
            author: 'Operations lead',
            role: 'Retail brand',
          },
          {
            quote:
              'Standard SaaS billing with trials made it easy to onboard new merchant accounts.',
            author: 'Platform admin',
            role: 'Marketplace operator',
          },
        ],
      },
    },
    {
      type: 'FAQ' as const,
      sortOrder: 6,
      config: {
        title: 'Frequently asked questions',
        items: [
          {
            q: 'Is there a free trial?',
            a: 'Yes. New stores start with a 14-day trial on the Growth plan.',
          },
          {
            q: 'Can I use my own domain?',
            a: 'Yes. Connect a custom domain from your store admin settings.',
          },
          {
            q: 'Which payment methods are supported?',
            a: 'Card payments via Stripe and mobile money via M-Pesa, configurable per tenant.',
          },
          {
            q: 'Can I customize the storefront?',
            a: 'Yes. Themes, branding, and CMS landing pages are available per store.',
          },
        ],
      },
    },
    {
      type: 'CTA' as const,
      sortOrder: 7,
      config: {
        title: 'Ready to launch your store?',
        subtitle: 'Create your account and start selling in minutes.',
        buttonLabel: 'Start free trial',
        buttonHref: 'http://localhost:3200/login',
      },
    },
  ];

  await prisma.platformPage.upsert({
    where: { slug: 'home' },
    update: {
      title: 'Nexora — Commerce platform',
      isHomepage: true,
      status: 'PUBLISHED',
      metaTitle: 'Nexora — Launch and scale your online store',
      metaDescription:
        'Multi-tenant SaaS commerce platform with catalog, orders, payments, and marketing.',
      publishedAt: new Date(),
    },
    create: {
      id: 'seed-platform-home',
      title: 'Nexora — Commerce platform',
      slug: 'home',
      isHomepage: true,
      status: 'PUBLISHED',
      metaTitle: 'Nexora — Launch and scale your online store',
      metaDescription:
        'Multi-tenant SaaS commerce platform with catalog, orders, payments, and marketing.',
      publishedAt: new Date(),
    },
  });

  const homepage = await prisma.platformPage.findUnique({ where: { slug: 'home' } });
  if (homepage) {
    await prisma.platformContentBlock.deleteMany({ where: { pageId: homepage.id } });
    await prisma.platformContentBlock.createMany({
      data: homepageBlocks.map((block) => ({
        pageId: homepage.id,
        type: block.type,
        sortOrder: block.sortOrder,
        config: block.config,
      })),
    });
  }
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

import type { PlatformContentBlock, PlatformPage, PlatformSiteSettings } from './cms';

/** Shown when CMS is offline or homepage not seeded yet. */
export const FALLBACK_SITE_SETTINGS: PlatformSiteSettings = {
  siteName: 'Nexora',
  tagline: 'Commerce platform for modern brands',
  primaryCtaLabel: 'Get started',
  primaryCtaHref: process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3200/login',
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
      links: [{ label: 'Contact', href: '#contact' }],
    },
  ],
  footerNote: '© Nexora Commerce',
};

export const FALLBACK_HOMEPAGE: PlatformPage = {
  id: 'fallback',
  title: 'Nexora — Commerce platform',
  slug: 'home',
  isHomepage: true,
  status: 'PUBLISHED',
  metaTitle: 'Nexora — Launch and scale your online store',
  metaDescription:
    'Multi-tenant SaaS commerce platform with catalog, orders, payments, and marketing.',
  blocks: [
    {
      id: 'fb-hero',
      type: 'HERO',
      sortOrder: 0,
      config: {
        eyebrow: 'Multi-tenant commerce platform',
        headline: 'Launch and scale your online store',
        subheadline:
          'Run catalog, orders, payments, and marketing on one platform. Sign in to configure your store.',
        primaryLabel: 'Get started',
        primaryHref: process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3200/login',
        secondaryLabel: 'View pricing',
        secondaryHref: '#pricing',
      },
    },
    {
      id: 'fb-features',
      type: 'FEATURES_GRID',
      sortOrder: 1,
      config: {
        title: 'Everything you need to sell online',
        subtitle: 'Standard commerce capabilities out of the box.',
        items: [
          { title: 'Product catalog', description: 'Products, variants, and inventory.' },
          { title: 'Orders', description: 'Checkout through fulfillment.' },
          { title: 'Payments', description: 'Stripe, M-Pesa, and more.' },
        ],
      },
    },
    {
      id: 'fb-pricing',
      type: 'PRICING',
      sortOrder: 2,
      config: {
        title: 'Simple pricing',
        subtitle: 'Plans load from the platform when the API is available.',
      },
    },
    {
      id: 'fb-cta',
      type: 'CTA',
      sortOrder: 3,
      config: {
        title: 'Ready to launch?',
        subtitle: 'Configure the full homepage in Super Admin → Marketing site.',
        buttonLabel: 'Open admin',
        buttonHref: process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3200/login',
      },
    },
  ] as PlatformContentBlock[],
};

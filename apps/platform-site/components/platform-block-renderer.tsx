import Link from 'next/link';
import type { PlatformContentBlock } from '@/lib/cms';
import type { PublicPlan } from '@/lib/plans';

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3200';

type Props = {
  blocks: PlatformContentBlock[];
  plans?: PublicPlan[];
};

export function PlatformBlockRenderer({ blocks, plans = [] }: Props) {
  return (
    <>
      {blocks.map((block) => (
        <Block key={block.id} block={block} plans={plans} />
      ))}
    </>
  );
}

function Block({
  block,
  plans,
}: {
  block: PlatformContentBlock;
  plans: PublicPlan[];
}) {
  const c = block.config;

  switch (block.type) {
    case 'HERO':
      return (
        <section className="border-b border-slate-200 bg-white py-20 sm:py-28">
          <div className="section-shell">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
                {String(c.eyebrow ?? 'Commerce platform')}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                {String(c.headline ?? 'Run your business on one platform')}
              </h1>
              {c.subheadline != null && c.subheadline !== '' && (
                <p className="mt-6 text-lg leading-8 text-slate-600">
                  {String(c.subheadline)}
                </p>
              )}
              <div className="mt-10 flex flex-wrap gap-4">
                {c.primaryLabel != null && c.primaryHref != null && (
                  <Link
                    href={String(c.primaryHref)}
                    className="inline-flex h-11 items-center rounded-md bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {String(c.primaryLabel)}
                  </Link>
                )}
                {c.secondaryLabel != null && c.secondaryHref != null && (
                  <Link
                    href={String(c.secondaryHref)}
                    className="inline-flex h-11 items-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {String(c.secondaryLabel)}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      );

    case 'LOGO_STRIP':
      return (
        <section className="border-b border-slate-200 bg-slate-50 py-10">
          <div className="section-shell">
            <p className="text-center text-sm font-medium text-slate-500">
              {String(c.title ?? 'Trusted by teams worldwide')}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {((c.logos as string[]) ?? []).map((logo) => (
                <span
                  key={logo}
                  className="text-sm font-semibold tracking-wide text-slate-400"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </section>
      );

    case 'FEATURES_GRID':
      return (
        <section id="features" className="py-20 sm:py-24">
          <div className="section-shell">
            <h2 className="section-title">{String(c.title ?? 'Everything you need')}</h2>
            {c.subtitle != null && c.subtitle !== '' && (
              <p className="section-lead">{String(c.subtitle)}</p>
            )}
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {(
                (c.items as Array<{ title: string; description: string }>) ?? []
              ).map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-slate-200 bg-white p-6"
                >
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'STATS_BAR':
      return (
        <section className="border-y border-slate-200 bg-slate-50 py-12">
          <div className="section-shell">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {(
                (c.items as Array<{ value: string; label: string }>) ?? []
              ).map((item) => (
                <div key={item.label} className="text-center sm:text-left">
                  <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'PRICING':
      return (
        <section id="pricing" className="py-20 sm:py-24">
          <div className="section-shell">
            <div className="max-w-2xl">
              <h2 className="section-title">{String(c.title ?? 'Simple pricing')}</h2>
              <p className="section-lead">
                {String(
                  c.subtitle ??
                    'Choose a plan that fits your business. Upgrade as you grow.',
                )}
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {plans
                .filter((p) => p.slug !== 'enterprise')
                .map((plan) => (
                  <div
                    key={plan.id}
                    className="flex flex-col rounded-lg border border-slate-200 bg-white p-6"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                    <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
                    <p className="mt-6 text-3xl font-semibold text-slate-900">
                      ${Number(plan.priceMonthly)}
                      <span className="text-base font-normal text-slate-500">/mo</span>
                    </p>
                    <ul className="mt-6 flex-1 space-y-2 text-sm text-slate-600">
                      {(plan.features ?? []).slice(0, 4).map((feature) => (
                        <li key={feature}>• {feature}</li>
                      ))}
                    </ul>
                    <Link
                      href={`${ADMIN_URL}/login`}
                      className="mt-8 inline-flex h-10 items-center justify-center rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Get started
                    </Link>
                  </div>
                ))}
            </div>
            {plans.some((p) => p.slug === 'enterprise') && (
              <p className="mt-8 text-sm text-slate-600">
                Need enterprise features?{' '}
                <Link href="#contact" className="font-medium text-blue-600 hover:underline">
                  Contact sales
                </Link>
              </p>
            )}
          </div>
        </section>
      );

    case 'TESTIMONIALS':
      return (
        <section className="border-t border-slate-200 bg-slate-50 py-20 sm:py-24">
          <div className="section-shell">
            <h2 className="section-title">{String(c.title ?? 'What customers say')}</h2>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {(
                (c.items as Array<{ quote: string; author: string; role: string }>) ??
                []
              ).map((item) => (
                <figure
                  key={item.author}
                  className="rounded-lg border border-slate-200 bg-white p-6"
                >
                  <blockquote className="text-sm leading-6 text-slate-700">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold text-slate-900">{item.author}</span>
                    <span className="text-slate-500"> — {item.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      );

    case 'FAQ':
      return (
        <section id="faq" className="py-20 sm:py-24">
          <div className="section-shell max-w-3xl">
            <h2 className="section-title">{String(c.title ?? 'Frequently asked questions')}</h2>
            <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              {((c.items as Array<{ q: string; a: string }>) ?? []).map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="cursor-pointer list-none text-base font-medium text-slate-900">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      );

    case 'CTA':
      return (
        <section id="contact" className="bg-slate-900 py-16 sm:py-20">
          <div className="section-shell text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              {String(c.title ?? 'Ready to launch your store?')}
            </h2>
            {c.subtitle != null && c.subtitle !== '' && (
              <p className="mx-auto mt-4 max-w-2xl text-slate-300">{String(c.subtitle)}</p>
            )}
            <Link
              href={String(c.buttonHref ?? `${ADMIN_URL}/login`)}
              className="mt-8 inline-flex h-11 items-center rounded-md bg-white px-5 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              {String(c.buttonLabel ?? 'Start free trial')}
            </Link>
          </div>
        </section>
      );

    case 'RICH_TEXT':
      return (
        <section className="py-16">
          <div className="section-shell prose-platform">
            <h2 className="text-2xl font-semibold text-slate-900">
              {String(c.title ?? '')}
            </h2>
            <p className="mt-4">{String(c.body ?? '')}</p>
          </div>
        </section>
      );

    default:
      return null;
  }
}

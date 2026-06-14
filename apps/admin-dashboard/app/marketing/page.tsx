'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
} from '@nexora/ui';
import { Megaphone, Ticket, Users, ArrowRight } from 'lucide-react';
import { fetchCampaigns, fetchCoupons } from '@/lib/marketing-api';
import { fetchSegments } from '@/lib/api';

const modules = [
  {
    href: '/marketing/campaigns',
    title: 'Campaigns',
    description: 'Email campaigns targeted at customer segments',
    icon: Megaphone,
  },
  {
    href: '/marketing/coupons',
    title: 'Coupons',
    description: 'Discount codes for checkout and promotions',
    icon: Ticket,
  },
  {
    href: '/marketing/segments',
    title: 'Segments',
    description: 'Group customers by order behavior',
    icon: Users,
  },
];

export default function MarketingPage() {
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  });
  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: fetchCoupons,
  });
  const { data: segments = [] } = useQuery({
    queryKey: ['segments'],
    queryFn: fetchSegments,
  });

  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const scheduledCampaigns = campaigns.filter((c) => c.status === 'SCHEDULED').length;

  return (
    <div className="admin-page">
      <PageHeader
        title="Marketing"
        description="Campaigns, coupons, and customer segments for your store"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold">{campaigns.length}</p>
            <p className="text-sm text-zinc-500">
              Campaigns
              {scheduledCampaigns > 0 && ` · ${scheduledCampaigns} scheduled`}
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold">{activeCoupons}</p>
            <p className="text-sm text-zinc-500">Active coupons</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardContent className="pt-6">
            <p className="text-2xl font-semibold">{segments.length}</p>
            <p className="text-sm text-zinc-500">Customer segments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {modules.map(({ href, title, description, icon: Icon }) => (
          <Card key={href} className="border-zinc-200/80 bg-white shadow-sm">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-500">{description}</p>
              <Link href={href}>
                <Button variant="outline" size="sm" className="gap-2">
                  Open
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-zinc-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Quick start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-600">
          <p>1. Create a coupon (e.g. WELCOME10) under Coupons.</p>
          <p>2. Define a customer segment under Segments and evaluate it.</p>
          <p>3. Launch an email campaign linked to that segment under Campaigns.</p>
          <p className="pt-2 text-zinc-500">
            Customers apply coupons at checkout on your storefront.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

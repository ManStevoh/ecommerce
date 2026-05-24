export type Tenant = {
  id: string;
  name: string;
  subdomain: string;
  plan: "starter" | "pro" | "enterprise";
  status: "active" | "suspended" | "trial";
  mrr: number;
  createdAt: string;
};

export type Subscription = {
  id: string;
  tenantId: string;
  tenantName: string;
  plan: string;
  amount: number;
  status: "active" | "past_due" | "cancelled";
  renewsAt: string;
};

export const tenants: Tenant[] = [
  {
    id: "t1",
    name: "Luxe Atelier",
    subdomain: "luxe",
    plan: "enterprise",
    status: "active",
    mrr: 499,
    createdAt: "2025-11-01",
  },
  {
    id: "t2",
    name: "Velvet & Vine",
    subdomain: "velvet",
    plan: "pro",
    status: "active",
    mrr: 149,
    createdAt: "2026-01-15",
  },
  {
    id: "t3",
    name: "Noir Collective",
    subdomain: "noir",
    plan: "pro",
    status: "trial",
    mrr: 0,
    createdAt: "2026-05-10",
  },
  {
    id: "t4",
    name: "Aurora Boutique",
    subdomain: "aurora",
    plan: "starter",
    status: "active",
    mrr: 49,
    createdAt: "2026-03-22",
  },
  {
    id: "t5",
    name: "Obsidian Goods",
    subdomain: "obsidian",
    plan: "starter",
    status: "suspended",
    mrr: 0,
    createdAt: "2025-08-05",
  },
];

export const subscriptions: Subscription[] = [
  {
    id: "sub_1",
    tenantId: "t1",
    tenantName: "Luxe Atelier",
    plan: "Enterprise",
    amount: 499,
    status: "active",
    renewsAt: "2026-06-01",
  },
  {
    id: "sub_2",
    tenantId: "t2",
    tenantName: "Velvet & Vine",
    plan: "Pro",
    amount: 149,
    status: "active",
    renewsAt: "2026-06-15",
  },
  {
    id: "sub_3",
    tenantId: "t3",
    tenantName: "Noir Collective",
    plan: "Pro Trial",
    amount: 0,
    status: "active",
    renewsAt: "2026-05-24",
  },
  {
    id: "sub_4",
    tenantId: "t5",
    tenantName: "Obsidian Goods",
    plan: "Starter",
    amount: 49,
    status: "past_due",
    renewsAt: "2026-04-05",
  },
];

export const platformStats = {
  totalTenants: 128,
  activeTenants: 112,
  totalMrr: 48250,
  totalOrders: 15420,
  growth: 18.4,
};

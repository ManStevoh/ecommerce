import { fetchAnalyticsRevenue } from './analytics';
import { fetchOrders } from './orders';
import { fetchProducts } from './products';

export type DashboardStats = {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [orders, products, analytics] = await Promise.all([
    fetchOrders(),
    fetchProducts(),
    fetchAnalyticsRevenue(),
  ]);

  const revenue =
    analytics?.total ??
    orders.reduce((sum, o) => sum + o.total, 0);
  const emails = new Set(orders.map((o) => o.customer));

  return {
    revenue,
    orders: analytics?.orders ?? orders.length,
    products: products.length,
    customers: emails.size,
  };
}

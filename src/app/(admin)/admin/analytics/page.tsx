'use client';

import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/lib/utils/format';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import StatsCard from '@/components/features/StatsCard';
import EmptyState from '@/components/ui/EmptyState';

const supabase = createClient();

export default function AdminAnalyticsPage() {
 const thirtyDaysAgo = new Date();
 thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

 const { data: stats, isLoading } = useQuery({
 queryKey: ['admin-analytics'],
 queryFn: async () => {
 // Total orders in 30d
 const { data: recentOrders, count: orderCount } = await supabase
 .from('orders')
 .select('id, total_amount, created_at', { count: 'exact' })
 .gte('created_at', thirtyDaysAgo.toISOString());

 // Active sellers
 const { count: sellerCount } = await supabase
 .from('profiles')
 .select('id', { count: 'exact', head: true })
 .eq('role', 'seller');

 // GMV
 const gmv = (recentOrders ?? []).reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
 const avgOrderValue = orderCount && orderCount > 0 ? gmv / orderCount : 0;

 // Top sellers by order count
 const { data: topSellersRaw } = await supabase
 .from('orders')
 .select('store:stores!inner(name, seller_id), total_amount')
 .gte('created_at', thirtyDaysAgo.toISOString());

 const sellerMap = new Map<string, { name: string; orders: number; revenue: number }>();
 for (const row of topSellersRaw ?? []) {
 const store = (row as unknown as { store: { name: string; seller_id: string }; total_amount: number }).store;
 if (!store) continue;
 const existing = sellerMap.get(store.seller_id) ?? { name: store.name, orders: 0, revenue: 0 };
 existing.orders += 1;
 existing.revenue += row.total_amount ?? 0;
 sellerMap.set(store.seller_id, existing);
 }

 const topSellers = Array.from(sellerMap.entries())
 .map(([id, data]) => ({ id, ...data }))
 .sort((a, b) => b.orders - a.orders)
 .slice(0, 10);

 // Repeat customer rate
 const { data: customerOrders } = await supabase
 .from('orders')
 .select('customer_id')
 .gte('created_at', thirtyDaysAgo.toISOString());

 const customerCounts = new Map<string, number>();
 for (const row of customerOrders ?? []) {
 customerCounts.set(row.customer_id, (customerCounts.get(row.customer_id) ?? 0) + 1);
 }

 const totalCustomers = customerCounts.size;
 const repeatCustomers = Array.from(customerCounts.values()).filter((c) => c > 1).length;
 const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

 // Orders over time (last 30 days)
 const dailyMap = new Map<string, number>();
 for (const row of recentOrders ?? []) {
 const dateKey = new Date(row.created_at).toLocaleDateString('en-CA');
 dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + 1);
 }

 const ordersOverTime = Array.from(dailyMap.entries())
 .sort(([a], [b]) => a.localeCompare(b))
 .slice(-30);

 return {
 totalOrders: orderCount ?? 0,
 gmv,
 avgOrderValue,
 activeSellers: sellerCount ?? 0,
 topSellers,
 repeatRate,
 ordersOverTime,
 };
 },
 });

 if (isLoading) {
 return (
 <div className="space-y-6">
 <Skeleton variant="rectangular" className="h-8 w-48" />
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {Array.from({ length: 4 }).map((_, i) => (
 <Skeleton key={i} variant="rectangular" className="h-28" />
 ))}
 </div>
 <Skeleton variant="rectangular" className="h-64" />
 </div>
 );
 }

 if (!stats) return null;

 return (
 <div className="space-y-6">
 <h1 className="text-2xl font-bold text-coral-crimson">Analytics</h1>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <StatsCard
 title="Total Orders (30d)"
 value={stats.totalOrders}
 icon={
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 }
 />
 <StatsCard
 title="GMV (30d)"
 value={formatPrice(stats.gmv)}
 icon={
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 }
 />
 <StatsCard
 title="Active Sellers"
 value={stats.activeSellers}
 icon={
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 }
 />
 <StatsCard
 title="Avg Order Value"
 value={formatPrice(stats.avgOrderValue)}
 icon={
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
 </svg>
 }
 />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Orders Over Time (CSS bars) */}
 <Card>
 <h3 className="font-semibold text-coral-crimson mb-4">Orders Over Time (30d)</h3>
 {stats.ordersOverTime.length > 0 ? (
 <div className="flex items-end gap-1 h-40">
 {stats.ordersOverTime.map(([date, count]) => {
 const maxCount = Math.max(...stats.ordersOverTime.map(([, c]) => c));
 const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
 return (
 <div
 key={date}
 className="flex flex-1 flex-col items-center gap-1"
 title={`${date}: ${count} orders`}
 >
 <span className="text-[10px] text-coral-crimson/50">{count}</span>
 <div
 className="w-full rounded-t-md bg-brand-500 transition-all"
 style={{ height:`${height}%`, minHeight: count > 0 ? '4px' : '0' }}
 />
 <span className="text-[10px] text-coral-crimson/50 -rotate-45 origin-left whitespace-nowrap">
 {date.slice(5)}
 </span>
 </div>
 );
 })}
 </div>
 ) : (
 <EmptyState title="No data yet" description="Orders from the last 30 days will appear here." />
 )}
 </Card>

 {/* Top Sellers */}
 <Card>
 <h3 className="font-semibold text-coral-crimson mb-4">Top Sellers</h3>
 {stats.topSellers.length > 0 ? (
 <div className="divide-y divide-gray-100">
 {stats.topSellers.map((seller, idx) => (
 <div key={seller.id} className="flex items-center gap-3 py-2.5">
 <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral-crimson/5 text-xs font-semibold text-coral-crimson/70">
 {idx + 1}
 </span>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-coral-crimson truncate">{seller.name}</p>
 <p className="text-xs text-coral-crimson/60">{seller.orders} orders</p>
 </div>
 <p className="text-sm font-semibold text-coral-crimson">{formatPrice(seller.revenue)}</p>
 </div>
 ))}
 </div>
 ) : (
 <EmptyState title="No data yet" description="Seller performance data will appear here." />
 )}
 </Card>
 </div>

 {/* Repeat Customer Rate */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Card>
 <h3 className="font-semibold text-coral-crimson mb-2">Repeat Customer Rate (30d)</h3>
 <p className="text-3xl font-bold text-brand-600">{stats.repeatRate.toFixed(1)}%</p>
 <p className="text-sm text-coral-crimson/60 mt-1">of customers placed more than one order</p>
 </Card>
 </div>
 </div>
 );
}

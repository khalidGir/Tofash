'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { ROUTES, ORDER_STATUS } from '@/lib/utils/constants';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '@/components/features/StatsCard';
import OrderTimeline from '@/components/features/OrderTimeline';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import type { Order } from '@/types/models';

const supabase = createClient();

function DashboardSkeleton() {
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

export default function SellerDashboardPage() {
 const { profile } = useAuthStore();

 const { data: stats, isLoading: statsLoading } = useQuery({
 queryKey: ['seller-dashboard-stats', profile?.id],
 queryFn: async () => {
 const sellerId = profile!.id;
 const today = new Date();
 today.setHours(0, 0, 0, 0);

 const { data: store } = await supabase
 .from('stores')
 .select('id')
 .eq('seller_id', sellerId)
 .single();

 if (!store) return null;

 const storeId = store.id;

 const { data: ordersToday } = await supabase
 .from('orders')
 .select('id', { count: 'exact' })
 .eq('store_id', storeId)
 .gte('created_at', today.toISOString());

 const { data: pendingOrders } = await supabase
 .from('orders')
 .select('id', { count: 'exact' })
 .eq('store_id', storeId)
 .in('status', [ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.PENDING_VERIFICATION]);

 const { data: activeProducts } = await supabase
 .from('products')
 .select('id', { count: 'exact' })
 .eq('store_id', storeId)
 .eq('is_available', true);

 const { data: reviews } = await supabase
 .from('reviews')
 .select('rating')
 .eq('store_id', storeId);

 const avgRating = reviews && reviews.length > 0
 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
 : 0;

 return {
 ordersToday: ordersToday?.length ?? 0,
 pendingOrders: pendingOrders?.length ?? 0,
 activeProducts: activeProducts?.length ?? 0,
 avgRating: avgRating.toFixed(1),
 };
 },
 enabled: !!profile?.id,
 });

 const { data: recentOrders, isLoading: ordersLoading } = useQuery({
 queryKey: ['seller-recent-orders', profile?.id],
 queryFn: async () => {
 const { data: store } = await supabase
 .from('stores')
 .select('id')
 .eq('seller_id', profile!.id)
 .single();

 if (!store) return [];

 const { data } = await supabase
 .from('orders')
 .select('*, items:order_items(*), customer:profiles(*) ')
 .eq('store_id', store.id)
 .order('created_at', { ascending: false })
 .limit(5);

 return (data ?? []) as Order[];
 },
 enabled: !!profile?.id,
 });

 if (statsLoading && ordersLoading) return <DashboardSkeleton />;

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h1 className="text-2xl font-bold text-coral-crimson">Dashboard</h1>
 <span className="text-sm text-coral-crimson/60">{formatDate(new Date().toISOString())}</span>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <StatsCard
 title="Orders Today"
 value={stats?.ordersToday ?? 0}
 icon={
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 }
 />
 <StatsCard
 title="Pending Orders"
 value={stats?.pendingOrders ?? 0}
 icon={
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 }
 trend={stats && stats.pendingOrders > 0 ? { direction: 'up', value:`${stats.pendingOrders} pending` } : undefined}
 />
 <StatsCard
 title="Active Products"
 value={stats?.activeProducts ?? 0}
 icon={
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
 </svg>
 }
 />
 <StatsCard
 title="Average Rating"
 value={stats?.avgRating ?? 'N/A'}
 icon={
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
 </svg>
 }
 />
 </div>

 {/* Recent Orders */}
 <Card>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-lg font-semibold text-coral-crimson">Recent Orders</h2>
 <Link
 href={ROUTES.SELLER.ORDERS}
 className="text-sm font-medium text-brand-600 hover:text-brand-700"
 >
 View All
 </Link>
 </div>

 {ordersLoading ? (
 <div className="space-y-3">
 {Array.from({ length: 3 }).map((_, i) => (
 <Skeleton key={i} variant="rectangular" className="h-16" />
 ))}
 </div>
 ) : recentOrders && recentOrders.length > 0 ? (
 <div className="divide-y divide-gray-100">
 {recentOrders.map((order) => (
 <Link
 key={order.id}
 href={`${ROUTES.SELLER.ORDERS}/${order.id}`}
 className="flex items-center justify-between py-3 hover:bg-coral-crimson/5 -mx-2 px-2 rounded-[90px] transition-colors"
 >
 <div className="min-w-0">
 <p className="text-sm font-medium text-coral-crimson">
 #{order.order_number}
 </p>
 <p className="text-xs text-coral-crimson/60 mt-0.5">
 {order.customer?.full_name ?? 'Customer'} &middot;{''}
 {formatPrice(order.total_amount)}
 </p>
 </div>
 <div className="flex items-center gap-3">
 <Badge variant={order.status === ORDER_STATUS.COMPLETED ? 'green' : order.status === ORDER_STATUS.REJECTED || order.status === ORDER_STATUS.CANCELLED ? 'red' : 'warm'} size="sm">
 {order.status.replace('_', '')}
 </Badge>
 <span className="text-xs text-coral-crimson/50">{formatDate(order.created_at)}</span>
 </div>
 </Link>
 ))}
 </div>
 ) : (
 <EmptyState
 title="No orders yet"
 description="When customers place orders, they will appear here."
 />
 )}
 </Card>

 {/* Quick Actions */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <Link href={ROUTES.SELLER.PRODUCTS + '/new'}>
 <Card hover className="flex items-center gap-4 py-5">
 <div className="flex h-10 w-10 items-center justify-center rounded-[90px] bg-green-100 text-green-600">
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 </div>
 <div>
 <p className="font-medium text-coral-crimson">Add Product</p>
 <p className="text-sm text-coral-crimson/60">List a new item</p>
 </div>
 </Card>
 </Link>
 <Link href={ROUTES.SELLER.ORDERS}>
 <Card hover className="flex items-center gap-4 py-5">
 <div className="flex h-10 w-10 items-center justify-center rounded-[90px] bg-coral-crimson/10 text-brand-600">
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 </div>
 <div>
 <p className="font-medium text-coral-crimson">View Orders</p>
 <p className="text-sm text-coral-crimson/60">Manage incoming orders</p>
 </div>
 </Card>
 </Link>
 <Link href={ROUTES.SELLER.SETTINGS}>
 <Card hover className="flex items-center gap-4 py-5">
 <div className="flex h-10 w-10 items-center justify-center rounded-[90px] bg-coral-crimson/10 text-coral-crimson/70">
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
 </svg>
 </div>
 <div>
 <p className="font-medium text-coral-crimson">Edit Store</p>
 <p className="text-sm text-coral-crimson/60">Update settings</p>
 </div>
 </Card>
 </Link>
 </div>
 </div>
 );
}

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { ROUTES, ORDER_STATUS, type OrderStatus } from '@/lib/utils/constants';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils/cn';
import type { Order } from '@/types/models';

const supabase = createClient();

const TABS = [
 { label: 'All', value: 'all' },
 { label: 'New', value: ORDER_STATUS.PENDING_PAYMENT },
 { label: 'Pending Verification', value: ORDER_STATUS.PENDING_VERIFICATION },
 { label: 'Accepted', value: ORDER_STATUS.ACCEPTED },
 { label: 'Rejected', value: ORDER_STATUS.REJECTED },
 { label: 'Completed', value: ORDER_STATUS.COMPLETED },
] as const;

function statusBadgeVariant(status: OrderStatus) {
 switch (status) {
 case ORDER_STATUS.COMPLETED: return'green';
 case ORDER_STATUS.REJECTED:
 case ORDER_STATUS.CANCELLED: return'red';
 case ORDER_STATUS.ACCEPTED: return'blue';
 case ORDER_STATUS.PENDING_PAYMENT:
 case ORDER_STATUS.PENDING_VERIFICATION: return'warm';
 default: return'gray';
 }
}

export default function SellerOrdersPage() {
 const { profile } = useAuthStore();
 const [activeTab, setActiveTab] = useState<string>('all');
 const [search, setSearch] = useState('');

 const { data: orders, isLoading } = useQuery({
 queryKey: ['seller-orders', profile?.id],
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
 .order('created_at', { ascending: false });

 return (data ?? []) as Order[];
 },
 enabled: !!profile?.id,
 });

 const filtered = useMemo(() => {
 if (!orders) return [];
 let result = orders;

 if (activeTab !== 'all') {
 result = result.filter((o) => o.status === activeTab);
 }

 if (search.trim()) {
 const q = search.toLowerCase();
 result = result.filter(
 (o) =>
 o.order_number.toLowerCase().includes(q) ||
 o.customer?.full_name?.toLowerCase().includes(q)
 );
 }

 return result;
 }, [orders, activeTab, search]);

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <h1 className="text-2xl font-bold text-coral-crimson">Orders</h1>
 <Input
 placeholder="Search by order # or customer..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="max-w-xs"
 icon={
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 }
 />
 </div>

 {/* Tabs */}
 <div className="flex gap-1 overflow-x-auto pb-1">
 {TABS.map((tab) => (
 <button
 key={tab.value}
 onClick={() => setActiveTab(tab.value)}
 className={cn(
'whitespace-nowrap rounded-[90px] px-4 py-2 text-sm font-medium transition-colors',
 activeTab === tab.value
 ? 'bg-brand-600 text-white'
 : 'bg-pure-white text-coral-crimson/70 hover:bg-coral-crimson/5 border border-coral-crimson/20'
 )}
 >
 {tab.label}
 {tab.value !== 'all' && orders && (
 <span className="ml-1.5 text-xs opacity-70">
 ({orders.filter((o) => o.status === tab.value).length})
 </span>
 )}
 </button>
 ))}
 </div>

 {/* Orders list */}
 {isLoading ? (
 <div className="space-y-3">
 {Array.from({ length: 5 }).map((_, i) => (
 <Skeleton key={i} variant="rectangular" className="h-20" />
 ))}
 </div>
 ) : filtered.length > 0 ? (
 <div className="space-y-3">
 {filtered.map((order) => (
 <Link key={order.id} href={`${ROUTES.SELLER.ORDERS}/${order.id}`}>
 <Card hover className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <span className="font-medium text-coral-crimson">#{order.order_number}</span>
 <Badge variant={statusBadgeVariant(order.status)} size="sm">
 {order.status.replace(/_/g, '')}
 </Badge>
 </div>
 <p className="text-sm text-coral-crimson/60 mt-1">
 {order.customer?.full_name ?? 'Customer'} &middot;{''}
 {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
 </p>
 </div>
 <div className="flex items-center gap-4 sm:text-right">
 <div>
 <p className="font-semibold text-coral-crimson">{formatPrice(order.total_amount)}</p>
 <p className="text-xs text-coral-crimson/50">{formatDate(order.created_at)}</p>
 </div>
 <svg className="h-5 w-5 text-coral-crimson/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </Card>
 </Link>
 ))}
 </div>
 ) : (
 <EmptyState
 title={search ? 'No orders match your search' : 'No orders yet'}
 description={search ? 'Try a different search term.' : 'When customers place orders, they will appear here.'}
 />
 )}
 </div>
 );
}

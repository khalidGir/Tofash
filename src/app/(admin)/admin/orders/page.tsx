'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ROUTES, ORDER_STATUS, type OrderStatus } from '@/lib/utils/constants';
import { formatDate, formatPrice } from '@/lib/utils/format';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils/cn';
import type { Order } from '@/types/models';

const supabase = createClient();

const STATUS_OPTIONS = [
 { value: 'all', label: 'All Statuses' },
 ...Object.entries(ORDER_STATUS).map(([key, value]) => ({
 value,
 label: key.replace(/_/g, ''),
 })),
];

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

export default function AdminOrdersPage() {
 const [search, setSearch] = useState('');
 const [statusFilter, setStatusFilter] = useState('all');

 const { data: orders, isLoading } = useQuery({
 queryKey: ['admin-orders'],
 queryFn: async () => {
 const { data } = await supabase
 .from('orders')
 .select('*, items:order_items(*), customer:profiles(*), store:stores(*) ')
 .order('created_at', { ascending: false });
 return (data ?? []) as Order[];
 },
 });

 const filtered = useMemo(() => {
 if (!orders) return [];
 let result = orders;

 if (statusFilter !== 'all') {
 result = result.filter((o) => o.status === statusFilter);
 }

 if (search.trim()) {
 const q = search.toLowerCase();
 result = result.filter(
 (o) =>
 o.order_number.toLowerCase().includes(q) ||
 o.customer?.full_name?.toLowerCase().includes(q) ||
 o.store?.name?.toLowerCase().includes(q)
 );
 }

 return result;
 }, [orders, search, statusFilter]);

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <h1 className="text-2xl font-bold text-coral-crimson">Order Monitoring</h1>
 <div className="flex gap-3">
 <Input
 placeholder="Search order, customer, store..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="max-w-xs"
 icon={
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 }
 />
 <Select
 options={STATUS_OPTIONS}
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="w-44"
 />
 </div>
 </div>

 {isLoading ? (
 <div className="space-y-3">
 {Array.from({ length: 8 }).map((_, i) => (
 <Skeleton key={i} variant="rectangular" className="h-16" />
 ))}
 </div>
 ) : filtered.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-coral-crimson/20 text-left">
 <th className="pb-3 font-medium text-coral-crimson/60">Order #</th>
 <th className="pb-3 font-medium text-coral-crimson/60">Customer</th>
 <th className="pb-3 font-medium text-coral-crimson/60">Store</th>
 <th className="pb-3 font-medium text-coral-crimson/60">Total</th>
 <th className="pb-3 font-medium text-coral-crimson/60">Status</th>
 <th className="pb-3 font-medium text-coral-crimson/60">Date</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {filtered.map((order) => (
 <tr key={order.id} className="hover:bg-coral-crimson/5 transition-colors">
 <td className="py-3 pr-4">
 <Link
 href={`${ROUTES.ADMIN.ORDERS}/${order.id}`}
 className="font-medium text-brand-600 hover:underline"
 >
 #{order.order_number}
 </Link>
 </td>
 <td className="py-3 pr-4 text-coral-crimson">{order.customer?.full_name ?? 'N/A'}</td>
 <td className="py-3 pr-4 text-coral-crimson/70">{order.store?.name ?? 'N/A'}</td>
 <td className="py-3 pr-4 font-medium text-coral-crimson">{formatPrice(order.total_amount)}</td>
 <td className="py-3 pr-4">
 <Badge variant={statusBadgeVariant(order.status)} size="sm">
 {order.status.replace(/_/g, '')}
 </Badge>
 </td>
 <td className="py-3 text-coral-crimson/50 text-xs">{formatDate(order.created_at)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : (
 <EmptyState
 title={search || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders yet'}
 description="Orders from all stores will appear here."
 />
 )}
 </div>
 );
}

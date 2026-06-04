'use client';

import { useState } from 'react';
import OrderCard from '@/components/features/OrderCard';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils/cn';
import { ORDER_STATUS } from '@/lib/utils/constants';
import type { OrderStatus } from '@/lib/utils/constants';
import type { Order } from '@/types/models';

type Tab = 'all' | OrderStatus;

const TABS: { key: Tab; label: string }[] = [
 { key: 'all', label: 'All' },
 { key: ORDER_STATUS.PENDING_PAYMENT, label: 'Pending Payment' },
 { key: ORDER_STATUS.PENDING_VERIFICATION, label: 'Pending Verification' },
 { key: ORDER_STATUS.ACCEPTED, label: 'Accepted' },
 { key: ORDER_STATUS.COMPLETED, label: 'Completed' },
];

// Mock data — replace with useQuery
const MOCK_ORDERS: Order[] = [];

export default function OrdersPage() {
 const [activeTab, setActiveTab] = useState<Tab>('all');
 const [loading, setLoading] = useState(false);
 const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

 const filteredOrders =
 activeTab === 'all'
 ? orders
 : orders.filter((o) => o.status === activeTab);

 return (
 <div>
 <h1 className="mb-6 text-2xl font-bold text-coral-crimson">My Orders</h1>

 {/* Tabs */}
 <div className="mb-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
 <div className="flex gap-2 sm:flex-wrap">
 {TABS.map((tab) => (
 <button
 key={tab.key}
 onClick={() => setActiveTab(tab.key)}
 className={cn(
'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
 activeTab === tab.key
 ? 'bg-brand-600 text-white'
 : 'bg-pure-white text-coral-crimson/70 border border-coral-crimson/20 hover:bg-coral-crimson/5'
 )}
 >
 {tab.label}
 </button>
 ))}
 </div>
 </div>

 {/* Loading */}
 {loading && (
 <div className="space-y-4">
 {[1, 2, 3].map((i) => (
 <Skeleton key={i} className="h-32 w-full rounded-[90px]" />
 ))}
 </div>
 )}

 {/* Empty state */}
 {!loading && filteredOrders.length === 0 && (
 <EmptyState
 icon={
 <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 }
 title={
 activeTab === 'all'
 ? 'No orders yet'
 :`No ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} orders`
 }
 description={
 activeTab === 'all'
 ? 'When you place an order, it will appear here.'
 : 'No orders match this filter.'
 }
 />
 )}

 {/* Orders list */}
 {!loading && filteredOrders.length > 0 && (
 <div className="space-y-4">
 {filteredOrders.map((order) => (
 <OrderCard key={order.id} order={order} role="customer" />
 ))}
 </div>
 )}

 {/* Refresh button */}
 <button
 onClick={() => {
 setLoading(true);
 setTimeout(() => setLoading(false), 500);
 }}
 className="mt-6 flex items-center gap-2 mx-auto text-sm text-coral-crimson/60 hover:text-coral-crimson transition-colors"
 >
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
 </svg>
 Refresh
 </button>
 </div>
 );
}

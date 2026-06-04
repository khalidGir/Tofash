'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Badge from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/utils/constants';
import type { Order } from '@/types/models';

interface OrderCardProps {
 order: Order;
 role: 'customer' |'seller';
}

const STATUS_BADGE_VARIANTS: Record<string, 'warm' |'green' |'red' |'blue' |'gray'> = {
 pending_payment: 'warm',
 pending_verification: 'warm',
 accepted: 'blue',
 completed: 'green',
 cancelled: 'gray',
 expired: 'gray',
 rejected: 'red',
};

export default function OrderCard({ order, role }: OrderCardProps) {
 const router = useRouter();

 const statusColor = STATUS_BADGE_VARIANTS[order.status] || 'gray';
 const items = order.items || [];
 const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
 const previewImage = items[0]?.product_image;

 return (
 <button
 onClick={() => router.push(`/customer/orders/${order.id}`)}
 className="w-full rounded-[90px] border border-coral-crimson/10 bg-pure-white p-4 text-left transition-shadow"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <p className="text-sm font-medium text-coral-crimson">
 #{order.order_number}
 </p>
 <Badge variant={statusColor} size="sm">
 {ORDER_STATUS_LABELS[order.status]}
 </Badge>
 </div>
 <p className="mt-1 text-xs text-coral-crimson/60">
 {formatDate(order.created_at)}
 </p>
 </div>
 <p className="shrink-0 text-sm font-semibold text-coral-crimson">
 {formatPrice(order.total_amount)}
 </p>
 </div>

 <div className="mt-3 flex items-center gap-3">
 {previewImage && (
 <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[90px] bg-coral-crimson/5">
 <Image
 src={previewImage}
 alt=""
 fill
 className="object-cover"
 sizes="40px"
 />
 </div>
 )}
 <p className="text-sm text-coral-crimson/70 truncate">
 {itemCount} item{itemCount !== 1 ? 's' : ''}
 </p>
 {order.fulfillment_type && (
 <span className="text-xs capitalize text-coral-crimson/50">
 {order.fulfillment_type}
 </span>
 )}
 </div>

 <div className="mt-3 flex flex-wrap gap-2">
 {order.status === 'pending_payment' && role === 'customer' && (
 <span className="rounded-[90px] bg-coral-crimson/5 px-3 py-1.5 text-xs font-medium text-brand-700">
 Upload payment proof
 </span>
 )}
 {order.status === 'accepted' && (
 <span className="rounded-[90px] bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
 Awaiting completion
 </span>
 )}
 {order.status === 'completed' && (
 <span className="rounded-[90px] bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
 Completed
 </span>
 )}
 </div>
 </button>
 );
}

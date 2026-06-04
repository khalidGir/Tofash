'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/lib/stores/uiStore';
import { ROUTES, ORDER_STATUS } from '@/lib/utils/constants';
import { formatDate, formatDateTime, formatPrice, formatPhone } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import OrderTimeline from '@/components/features/OrderTimeline';
import type { Order, PaymentProof } from '@/types/models';

const supabase = createClient();

function statusBadgeVariant(status: string) {
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

export default function SellerOrderDetailPage() {
 const params = useParams<{ id: string }>();
 const router = useRouter();
 const queryClient = useQueryClient();
 const addToast = useUIStore((s) => s.addToast);
 const [rejectModal, setRejectModal] = useState(false);
 const [rejectReason, setRejectReason] = useState('');
 const [actionLoading, setActionLoading] = useState(false);

 const { data: order, isLoading } = useQuery({
 queryKey: ['seller-order', params.id],
 queryFn: async () => {
 const { data } = await supabase
 .from('orders')
 .select('*, items:order_items(*), customer:profiles(*), payment_proofs(*) ')
 .eq('id', params.id)
 .single();
 if (!data) throw new Error('Order not found');
 return data as unknown as Order & { payment_proofs: PaymentProof[] };
 },
 });

 const handleAccept = async () => {
 setActionLoading(true);
 try {
 const { error } = await supabase
 .from('orders')
 .update({ status: ORDER_STATUS.ACCEPTED })
 .eq('id', params.id);
 if (error) throw error;
 addToast({ type: 'success', message: 'Order accepted' });
 queryClient.invalidateQueries({ queryKey: ['seller-order', params.id] });
 } catch (err) {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to accept order' });
 } finally {
 setActionLoading(false);
 }
 };

 const handleReject = async () => {
 setActionLoading(true);
 try {
 const notes = rejectReason
 ?`Rejected: ${rejectReason}`
 : 'Rejected by seller';
 const { error } = await supabase
 .from('orders')
 .update({ status: ORDER_STATUS.REJECTED, notes })
 .eq('id', params.id);
 if (error) throw error;
 addToast({ type: 'success', message: 'Order rejected' });
 queryClient.invalidateQueries({ queryKey: ['seller-order', params.id] });
 setRejectModal(false);
 setRejectReason('');
 } catch (err) {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to reject order' });
 } finally {
 setActionLoading(false);
 }
 };

 const handleComplete = async () => {
 setActionLoading(true);
 try {
 const { error } = await supabase
 .from('orders')
 .update({ status: ORDER_STATUS.COMPLETED, completed_at: new Date().toISOString() })
 .eq('id', params.id);
 if (error) throw error;
 addToast({ type: 'success', message: 'Order marked as completed' });
 queryClient.invalidateQueries({ queryKey: ['seller-order', params.id] });
 } catch (err) {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to complete order' });
 } finally {
 setActionLoading(false);
 }
 };

 if (isLoading) {
 return (
 <div className="space-y-4">
 <Skeleton variant="rectangular" className="h-8 w-48" />
 <Skeleton variant="rectangular" className="h-48" />
 </div>
 );
 }

 if (!order) {
 return (
 <EmptyState
 icon={
 <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 }
 title="Order not found"
 description="This order may have been deleted."
 action={{ label: 'Back to Orders', onClick: () => router.push(ROUTES.SELLER.ORDERS) }}
 />
 );
 }

 const items = order.items ?? [];
 const proofs = (order as any).payment_proofs as PaymentProof[] | undefined;
 const latestProof = proofs && proofs.length > 0 ? proofs[proofs.length - 1] : null;

 return (
 <div className="space-y-6">
 {/* Back button */}
 <Link
 href={ROUTES.SELLER.ORDERS}
 className="inline-flex items-center gap-1.5 text-sm text-coral-crimson/60 hover:text-coral-crimson transition-colors"
 >
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
 </svg>
 Back to Orders
 </Link>

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-coral-crimson">Order #{order.order_number}</h1>
 <p className="text-sm text-coral-crimson/60 mt-1">Placed on {formatDateTime(order.created_at)}</p>
 </div>
 <div className="flex items-center gap-2">
 <Badge variant={statusBadgeVariant(order.status)} size="md" className="capitalize">
 {order.status.replace(/_/g, '')}
 </Badge>
 <Link
 href={`${ROUTES.SELLER.CHAT}/${params.id}`}
 className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"
 >
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
 </svg>
 Chat with Customer
 </Link>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 space-y-6">
 {/* Customer Info */}
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">Customer</h2>
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral-crimson/10 text-brand-700 font-medium text-sm">
 {order.customer?.full_name?.charAt(0).toUpperCase() ?? '? '}
 </div>
 <div>
 <p className="font-medium text-coral-crimson">{order.customer?.full_name ?? 'Unknown'}</p>
 {order.customer?.phone && (
 <p className="text-sm text-coral-crimson/60">{formatPhone(order.customer.phone)}</p>
 )}
 </div>
 </div>
 {order.notes && (
 <div className="mt-4 rounded-[90px] bg-coral-crimson/5 border border-coral-crimson/20 p-3">
 <p className="text-xs font-medium text-coral-crimson uppercase tracking-wider">Customer Notes</p>
 <p className="mt-1 text-sm text-coral-crimson">{order.notes}</p>
 </div>
 )}
 </Card>

 {/* Order Items */}
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">Items</h2>
 <div className="divide-y divide-gray-100">
 {items.map((item) => (
 <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
 <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[90px] bg-coral-crimson/5">
 {item.product_image && (
 <Image
 src={item.product_image}
 alt={item.product_name}
 fill
 className="object-cover"
 sizes="56px"
 />
 )}
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-medium text-coral-crimson">{item.product_name}</p>
 <p className="text-sm text-coral-crimson/60">Qty: {item.quantity}</p>
 </div>
 <p className="text-sm font-semibold text-coral-crimson">{formatPrice(item.subtotal)}</p>
 </div>
 ))}
 </div>
 <div className="mt-4 flex items-center justify-between border-t border-coral-crimson/10 pt-4">
 <span className="text-sm font-medium text-coral-crimson">Total</span>
 <span className="text-lg font-bold text-coral-crimson">{formatPrice(order.total_amount)}</span>
 </div>
 </Card>

 {/* Payment Proof Section */}
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">Payment Proof</h2>
 {order.status === ORDER_STATUS.PENDING_VERIFICATION && latestProof && (
 <div className="space-y-4">
 <a
 href={latestProof.image_url}
 target="_blank"
 rel="noopener noreferrer"
 className="block relative aspect-video rounded-[90px] overflow-hidden bg-coral-crimson/5"
 >
 <Image
 src={latestProof.image_url}
 alt="Payment proof"
 fill
 className="object-contain"
 sizes="(max-width: 768px) 100vw, 600px"
 />
 </a>
 {latestProof.note && (
 <p className="text-sm text-coral-crimson/70">{latestProof.note}</p>
 )}
 <div className="flex gap-3">
 <Button onClick={handleAccept} loading={actionLoading} className="flex-1">
 Approve Payment
 </Button>
 <Button variant="danger" onClick={() => setRejectModal(true)} disabled={actionLoading} className="flex-1">
 Reject Payment
 </Button>
 </div>
 </div>
 )}
 {order.status === ORDER_STATUS.ACCEPTED && (
 <div className="rounded-[90px] bg-blue-50 border border-blue-200 p-4 text-center">
 <svg className="mx-auto h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p className="mt-1 text-sm font-medium text-blue-800">Payment Accepted</p>
 </div>
 )}
 {order.status === ORDER_STATUS.COMPLETED && (
 <div className="rounded-[90px] bg-green-50 border border-green-200 p-4 text-center">
 <svg className="mx-auto h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 <p className="mt-1 text-sm font-medium text-green-800">Completed</p>
 </div>
 )}
 {!latestProof && order.status !== ORDER_STATUS.ACCEPTED && order.status !== ORDER_STATUS.COMPLETED && (
 <p className="text-sm text-coral-crimson/50">No payment proof uploaded yet.</p>
 )}
 </Card>
 </div>

 {/* Sidebar */}
 <div className="space-y-6">
 {/* Status Timeline */}
 <Card>
 <h2 className="text-sm font-semibold text-coral-crimson mb-4">Order Timeline</h2>
 <OrderTimeline
 currentStatus={order.status}
 timestamps={{
 created_at: order.created_at,
 paid_at: order.paid_at,
 completed_at: order.completed_at,
 }}
 />
 </Card>

 {/* Actions */}
 {(order.status === ORDER_STATUS.PENDING_VERIFICATION || order.status === ORDER_STATUS.ACCEPTED) && (
 <Card>
 <h2 className="text-sm font-semibold text-coral-crimson mb-3">Actions</h2>
 <div className="space-y-2">
 {order.status === ORDER_STATUS.PENDING_VERIFICATION && (
 <>
 <Button className="w-full" onClick={handleAccept} loading={actionLoading}>
 Accept Order
 </Button>
 <Button className="w-full" variant="danger" onClick={() => setRejectModal(true)} disabled={actionLoading}>
 Reject Order
 </Button>
 </>
 )}
 {order.status === ORDER_STATUS.ACCEPTED && (
 <Button className="w-full" variant="primary" onClick={handleComplete} loading={actionLoading}>
 Mark as Completed
 </Button>
 )}
 </div>
 </Card>
 )}
 </div>
 </div>

 {/* Rejection Reason Modal */}
 <Modal open={rejectModal} onClose={() => !actionLoading && setRejectModal(false)} title="Reject Order" size="sm">
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-coral-crimson mb-1">
 Reason for rejection
 </label>
 <textarea
 value={rejectReason}
 onChange={(e) => setRejectReason(e.target.value)}
 placeholder="Explain why this order is being rejected..."
 rows={3}
 className="w-full rounded-[90px] border border-coral-crimson/20 bg-pure-white px-3 py-2 text-sm text-coral-crimson placeholder:text-coral-crimson/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors resize-none"
 />
 </div>
 <div className="flex items-center gap-3 justify-end">
 <Button variant="secondary" onClick={() => setRejectModal(false)} disabled={actionLoading}>
 Cancel
 </Button>
 <Button variant="danger" loading={actionLoading} onClick={handleReject}>
 Reject Order
 </Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}

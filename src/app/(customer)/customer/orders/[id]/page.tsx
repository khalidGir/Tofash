'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/lib/stores/uiStore';
import { ROUTES, ORDER_STATUS } from '@/lib/utils/constants';
import { formatDate, formatDateTime, formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import OrderTimeline from '@/components/features/OrderTimeline';
import PaymentProofUpload from '@/components/features/PaymentProofUpload';
import ReviewForm from '@/components/features/ReviewForm';
import type { Order, PaymentProof, Review } from '@/types/models';

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

function isCancellable(status: string) {
 return status === ORDER_STATUS.PENDING_PAYMENT || status === ORDER_STATUS.PENDING_VERIFICATION;
}

export default function CustomerOrderDetailPage() {
 const params = useParams<{ id: string }>();
 const router = useRouter();
 const queryClient = useQueryClient();
 const addToast = useUIStore((s) => s.addToast);
 const [cancelling, setCancelling] = useState(false);
 const [cancelModal, setCancelModal] = useState(false);

 const { data: order, isLoading } = useQuery({
 queryKey: ['customer-order', params.id],
 queryFn: async () => {
 const { data } = await supabase
 .from('orders')
 .select('*, items:order_items(*), payment_proofs(*), store:stores(*) ')
 .eq('id', params.id)
 .single();
 if (!data) throw new Error('Order not found');
 return data as unknown as Order & { payment_proofs: PaymentProof[] };
 },
 });

 const { data: reviews } = useQuery({
 queryKey: ['order-reviews', params.id],
 queryFn: async () => {
 const { data } = await supabase
 .from('reviews')
 .select('*')
 .eq('order_id', params.id);
 return (data ?? []) as Review[];
 },
 enabled: !!order && order.status === ORDER_STATUS.COMPLETED,
 });

 const handleCancel = async () => {
 setCancelling(true);
 try {
 const { error } = await supabase
 .from('orders')
 .update({ status: ORDER_STATUS.CANCELLED, cancelled_at: new Date().toISOString() })
 .eq('id', params.id);
 if (error) throw error;
 addToast({ type: 'success', message: 'Order cancelled' });
 queryClient.invalidateQueries({ queryKey: ['customer-order', params.id] });
 setCancelModal(false);
 } catch (err) {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to cancel order' });
 } finally {
 setCancelling(false);
 }
 };

 const handleReviewSubmit = async (data: { rating: number; content: string }) => {
 if (!order?.items?.[0]) return;
 const { error } = await supabase.from('reviews').insert({
 product_id: order.items[0].product_id,
 order_id: params.id,
 customer_id: order.customer_id,
 rating: data.rating,
 content: data.content || null,
 });
 if (error) throw error;
 addToast({ type: 'success', message: 'Review submitted' });
 queryClient.invalidateQueries({ queryKey: ['order-reviews', params.id] });
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
 action={{ label: 'Back to Orders', onClick: () => router.push(ROUTES.CUSTOMER.ORDERS) }}
 />
 );
 }

 const items = order.items ?? [];
 const proofs = (order as any).payment_proofs as PaymentProof[] | undefined;
 const latestProof = proofs && proofs.length > 0 ? proofs[proofs.length - 1] : null;
 const hasReviewed = reviews && reviews.length > 0;

 return (
 <div className="space-y-6">
 {/* Back button */}
 <Link
 href={ROUTES.CUSTOMER.ORDERS}
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
 {order.store && (
 <Link
 href={`${ROUTES.CUSTOMER.CHAT}/${params.id}`}
 className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"
 >
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
 </svg>
 Chat with Seller
 </Link>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 space-y-6">
 {/* Items */}
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
 <p className="text-sm text-coral-crimson/60">{formatPrice(item.unit_price)} x {item.quantity}</p>
 </div>
 <p className="text-sm font-semibold text-coral-crimson">{formatPrice(item.subtotal)}</p>
 </div>
 ))}
 </div>
 </Card>

 {/* Order Summary */}
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">Order Summary</h2>
 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm">
 <span className="text-coral-crimson/70">Subtotal</span>
 <span className="font-medium text-coral-crimson">{formatPrice(order.total_amount)}</span>
 </div>
 <div className="flex items-center justify-between border-t border-coral-crimson/10 pt-2">
 <span className="font-medium text-coral-crimson">Total</span>
 <span className="text-lg font-bold text-coral-crimson">{formatPrice(order.total_amount)}</span>
 </div>
 </div>
 </Card>

 {/* Payment Section */}
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">Payment</h2>
 {order.status === ORDER_STATUS.PENDING_PAYMENT && (
 <PaymentProofUpload
 orderId={order.id}
 onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ['customer-order', params.id] })}
 />
 )}
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
 <div className="rounded-[90px] bg-coral-crimson/5 border border-coral-crimson/20 p-4 text-center">
 <svg className="mx-auto h-8 w-8 text-coral-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p className="mt-1 text-sm font-medium text-coral-crimson">Waiting for seller verification</p>
 </div>
 </div>
 )}
 {(order.status === ORDER_STATUS.ACCEPTED || order.status === ORDER_STATUS.COMPLETED) && latestProof && (
 <div>
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
 {latestProof.verified_at && (
 <p className="mt-2 text-sm text-green-600">
 Verified on {formatDateTime(latestProof.verified_at)}
 </p>
 )}
 </div>
 )}
 </Card>

 {/* Review Form */}
 {order.status === ORDER_STATUS.COMPLETED && !hasReviewed && (
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">Leave a Review</h2>
 <ReviewForm
 productId={items[0]?.product_id ?? ''}
 orderId={order.id}
 onSubmit={handleReviewSubmit}
 />
 </Card>
 )}
 {order.status === ORDER_STATUS.COMPLETED && hasReviewed && (
 <Card>
 <div className="rounded-[90px] bg-green-50 border border-green-200 p-4 text-center">
 <svg className="mx-auto h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p className="mt-1 text-sm font-medium text-green-800">You have reviewed this order</p>
 </div>
 </Card>
 )}
 </div>

 {/* Sidebar */}
 <div className="space-y-6">
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

 {isCancellable(order.status) && (
 <Card>
 <h2 className="text-sm font-semibold text-coral-crimson mb-3">Actions</h2>
 <Button
 className="w-full"
 variant="danger"
 onClick={() => setCancelModal(true)}
 >
 Cancel Order
 </Button>
 </Card>
 )}
 </div>
 </div>

 {/* Cancel Confirmation Modal */}
 <Modal open={cancelModal} onClose={() => !cancelling && setCancelModal(false)} title="Cancel Order" size="sm">
 <p className="text-sm text-coral-crimson/70">
 Are you sure you want to cancel order <strong>#{order.order_number}</strong>? This action cannot be undone.
 </p>
 <div className="mt-6 flex items-center gap-3 justify-end">
 <Button variant="secondary" onClick={() => setCancelModal(false)} disabled={cancelling}>
 Keep Order
 </Button>
 <Button variant="danger" loading={cancelling} onClick={handleCancel}>
 Yes, Cancel
 </Button>
 </div>
 </Modal>
 </div>
 );
}

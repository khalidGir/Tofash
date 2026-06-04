'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/lib/stores/cartStore';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';
import type { FulfillmentType } from '@/lib/utils/constants';

export default function CheckoutPage() {
 const router = useRouter();
 const { items, getSubtotal, notes, setStoreNotes, clearCart } = useCartStore();
 const [mounted, setMounted] = useState(false);
 const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('pickup');
 const [scheduleType, setScheduleType] = useState< 'immediate' |'scheduled'>('immediate');
 const [scheduledDate, setScheduledDate] = useState('');
 const [scheduledTime, setScheduledTime] = useState('');
 const [customerNotes, setCustomerNotes] = useState(notes);
 const [placing, setPlacing] = useState(false);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 setMounted(true);
 }, []);

 useEffect(() => {
 setStoreNotes(customerNotes);
 }, [customerNotes, setStoreNotes]);

 if (!mounted) {
 return (
 <div className="space-y-4">
 <Skeleton className="h-8 w-48" />
 <Skeleton className="h-40 w-full" />
 <Skeleton className="h-40 w-full" />
 <Skeleton className="h-32 w-full" />
 </div>
 );
 }

 if (items.length === 0) {
 router.replace('/customer/cart');
 return null;
 }

 const subtotal = getSubtotal();

 const handlePlaceOrder = async () => {
 setPlacing(true);
 setError(null);

 try {
 const scheduledAt =
 scheduleType === 'scheduled' && scheduledDate && scheduledTime
 ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
 : null;

 const res = await fetch('/api/orders', {
 method: 'POST',
 headers: {'Content-Type': 'application/json' },
 body: JSON.stringify({
 items: items.map((i) => ({
 product_id: i.product_id,
 quantity: i.quantity,
 notes: i.notes,
 })),
 fulfillment_type: fulfillmentType,
 scheduled_at: scheduledAt,
 notes: customerNotes,
 }),
 });

 const data = await res.json();

 if (!res.ok) {
 throw new Error(data.error || 'Failed to place order');
 }

 clearCart();
 router.push(`/customer/orders/${data.order_id}`);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Something went wrong');
 } finally {
 setPlacing(false);
 }
 };

 return (
 <div>
 <h1 className="mb-6 text-2xl font-bold text-coral-crimson">Checkout</h1>

 <div className="grid gap-8 lg:grid-cols-3">
 <div className="lg:col-span-2 space-y-6">
 {/* Order items summary */}
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">
 Order Items
 </h2>
 <div className="divide-y divide-gray-100">
 {items.map((item) => (
 <div key={item.product_id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
 <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[90px] bg-coral-crimson/5">
 {item.product_image ? (
 <Image
 src={item.product_image}
 alt={item.product_name}
 fill
 className="object-cover"
 sizes="56px"
 />
 ) : (
 <div className="flex h-full items-center justify-center text-coral-crimson/30">
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 </div>
 )}
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-sm font-medium text-coral-crimson">{item.product_name}</p>
 <p className="text-xs text-coral-crimson/60">Qty: {item.quantity}</p>
 </div>
 <p className="text-sm font-medium text-coral-crimson">
 {formatPrice(item.unit_price * item.quantity)}
 </p>
 </div>
 ))}
 </div>
 </Card>

 {/* Customer notes */}
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">
 Notes
 </h2>
 <textarea
 value={customerNotes}
 onChange={(e) => setCustomerNotes(e.target.value)}
 placeholder="Any special instructions for the seller?"
 rows={3}
 className="w-full rounded-[90px] border border-coral-crimson/20 bg-pure-white px-3 py-2 text-sm text-coral-crimson placeholder:text-coral-crimson/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors resize-none"
 />
 </Card>

 {/* Fulfillment type */}
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">
 Fulfillment Type
 </h2>
 <div className="flex gap-3">
 {(['pickup', 'delivery'] as const).map((type) => (
 <button
 key={type}
 onClick={() => setFulfillmentType(type)}
 className={cn(
'flex flex-1 items-center justify-center gap-2 rounded-[90px] border-2 px-4 py-3 text-sm font-medium transition-colors',
 fulfillmentType === type
 ? 'border-brand-600 bg-coral-crimson/5 text-brand-700'
 : 'border-coral-crimson/20 text-coral-crimson/70 hover:border-coral-crimson/30'
 )}
 >
 {type === 'pickup' ? (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 ) : (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1m3-1l-2 1m5 0l2-1m-2 1v2a1 1 0 001 1h3m-6 0a1 1 0 00-1-1H9m6 0a1 1 0 00-1-1h-2m6 2a1 1 0 001-1v-3a1 1 0 00-1-1h-3" />
 </svg>
 )}
 {type === 'pickup' ? 'Pickup' : 'Delivery'}
 </button>
 ))}
 </div>
 </Card>

 {/* Schedule type */}
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">
 Schedule
 </h2>
 <div className="flex gap-3 mb-4">
 {(['immediate', 'scheduled'] as const).map((type) => (
 <button
 key={type}
 onClick={() => setScheduleType(type)}
 className={cn(
'flex flex-1 items-center justify-center gap-2 rounded-[90px] border-2 px-4 py-3 text-sm font-medium transition-colors',
 scheduleType === type
 ? 'border-brand-600 bg-coral-crimson/5 text-brand-700'
 : 'border-coral-crimson/20 text-coral-crimson/70 hover:border-coral-crimson/30'
 )}
 >
 {type === 'immediate' ? (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 ) : (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 )}
 {type === 'immediate' ? 'ASAP' : 'Schedule'}
 </button>
 ))}
 </div>

 {scheduleType === 'scheduled' && (
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-sm font-medium text-coral-crimson mb-1">
 Date
 </label>
 <input
 type="date"
 value={scheduledDate}
 onChange={(e) => setScheduledDate(e.target.value)}
 min={new Date().toISOString().split('T')[0]}
 className="block w-full rounded-[90px] border border-coral-crimson/20 bg-pure-white px-3 py-2.5 text-sm text-coral-crimson focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-coral-crimson mb-1">
 Time
 </label>
 <input
 type="time"
 value={scheduledTime}
 onChange={(e) => setScheduledTime(e.target.value)}
 className="block w-full rounded-[90px] border border-coral-crimson/20 bg-pure-white px-3 py-2.5 text-sm text-coral-crimson focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
 />
 </div>
 </div>
 )}
 </Card>
 </div>

 {/* Sidebar */}
 <div className="lg:col-span-1">
 <Card className="sticky top-24">
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">
 Payment Summary
 </h2>
 <div className="space-y-3">
 <div className="flex items-center justify-between text-sm">
 <span className="text-coral-crimson/70">Subtotal</span>
 <span className="font-medium text-coral-crimson">{formatPrice(subtotal)}</span>
 </div>
 <div className="border-t border-coral-crimson/10 pt-3">
 <div className="flex items-center justify-between">
 <span className="text-base font-semibold text-coral-crimson">Total</span>
 <span className="text-base font-semibold text-coral-crimson">{formatPrice(subtotal)}</span>
 </div>
 <p className="mt-1 text-xs text-coral-crimson/60">
 Pay on {fulfillmentType === 'pickup' ? 'pickup' : 'delivery'} via bank transfer or mobile money
 </p>
 </div>
 </div>

 {error && (
 <p className="mt-4 text-sm text-red-600">{error}</p>
 )}

 <Button
 className="mt-6 w-full"
 size="lg"
 onClick={handlePlaceOrder}
 loading={placing}
 >
 Place Order
 </Button>
 </Card>
 </div>
 </div>
 </div>
 );
}

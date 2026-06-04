'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/stores/cartStore';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import CartItemComponent from '@/components/features/CartItem';
import { useEffect, useState } from 'react';

export default function CartPage() {
 const router = useRouter();
 const {
 items,
 getSubtotal,
 updateQuantity,
 removeItem,
 updateNotes,
 } = useCartStore();
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
 setMounted(true);
 }, []);

 if (!mounted) {
 return (
 <div className="space-y-4">
 <Skeleton className="h-8 w-40" />
 <Skeleton className="h-32 w-full" />
 <Skeleton className="h-32 w-full" />
 <div className="mt-6">
 <Skeleton className="h-48 w-full" />
 </div>
 </div>
 );
 }

 if (items.length === 0) {
 return (
 <EmptyState
 icon={
 <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
 </svg>
 }
 title="Your cart is empty"
 description="Looks like you haven't added any desserts yet. Browse our selection and find something sweet!"
 action={{
 label: 'Browse Desserts',
 onClick: () => router.push('/search'),
 }}
 />
 );
 }

 const subtotal = getSubtotal();

 return (
 <div>
 <h1 className="mb-6 text-2xl font-bold text-coral-crimson">Shopping Cart</h1>

 <div className="grid gap-8 lg:grid-cols-3">
 {/* Cart items */}
 <div className="lg:col-span-2 space-y-4">
 {items.map((item) => (
 <CartItemComponent
 key={item.product_id}
 item={item}
 onUpdateQuantity={updateQuantity}
 onRemove={removeItem}
 onUpdateNotes={updateNotes}
 />
 ))}
 </div>

 {/* Order summary */}
 <div className="lg:col-span-1">
 <Card className="sticky top-24">
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">
 Order Summary
 </h2>
 <div className="space-y-3">
 <div className="flex items-center justify-between text-sm">
 <span className="text-coral-crimson/70">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
 <span className="font-medium text-coral-crimson">{formatPrice(subtotal)}</span>
 </div>
 <div className="border-t border-coral-crimson/10 pt-3">
 <div className="flex items-center justify-between">
 <span className="text-base font-semibold text-coral-crimson">Estimated Total</span>
 <span className="text-base font-semibold text-coral-crimson">{formatPrice(subtotal)}</span>
 </div>
 <p className="mt-1 text-xs text-coral-crimson/60">
 Delivery fee calculated at checkout
 </p>
 </div>
 </div>
 <Button
 className="mt-6 w-full"
 size="lg"
 onClick={() => router.push('/customer/checkout')}
 >
 Proceed to Checkout
 </Button>
 <Link
 href="/search"
 className="mt-3 block text-center text-sm text-brand-600 hover:text-brand-700 transition-colors"
 >
 Continue Shopping
 </Link>
 </Card>
 </div>
 </div>
 </div>
 );
}

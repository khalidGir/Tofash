'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Product, Review, Store } from '@/types/models';
import StarRating from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';

const MOCK_STORE: Store = {
 id: '1', seller_id: 's1', name: 'Sweet Tooth Bakery', slug: 'sweet-tooth-bakery',
 description: null, logo_url: null, banner_url: null, is_featured: true, is_active: true,
 preparation_time_minutes: 30, created_at: '', updated_at: '',
};

const MOCK_PRODUCT: Product = {
 id: 'p1', store_id: '1', category_id: 'c1',
 name: 'Chocolate Fudge Cake', slug: 'chocolate-fudge-cake',
 description: 'Indulge in our signature Chocolate Fudge Cake — three layers of rich, moist chocolate sponge, filled and covered with silky Belgian chocolate fudge ganache. Each slice is a little piece of heaven, perfect for birthdays, celebrations, or whenever you need a chocolate fix.\n\nAll our cakes are baked fresh to order using premium ingredients. No preservatives, no shortcuts — just pure homemade goodness.',
 price: 450, compare_at_price: 550,
 images: [],
 is_available: true, preparation_time_minutes: 45,
 created_at: '2025-01-01', updated_at: '2025-01-01',
 store: MOCK_STORE,
};

const MOCK_REVIEWS: Review[] = [
 { id: 'r1', product_id: 'p1', order_id: 'o1', customer_id: 'c1', rating: 5, content: 'Absolutely divine! The chocolate fudge was perfectly rich without being too sweet. Will definitely order again.', created_at: '2025-03-15T10:00:00Z', customer: { id: 'c1', phone: '+251911111111', full_name: 'Sara T.', avatar_url: null, role: 'customer', created_at: '', updated_at: '' } },
 { id: 'r2', product_id: 'p1', order_id: 'o2', customer_id: 'c2', rating: 4, content: 'Really good cake! Moist and flavorful. Only giving 4 stars because delivery was a bit late.', created_at: '2025-03-20T14:30:00Z', customer: { id: 'c2', phone: '+251922222222', full_name: 'Meron A.', avatar_url: null, role: 'customer', created_at: '', updated_at: '' } },
 { id: 'r3', product_id: 'p1', order_id: 'o3', customer_id: 'c3', rating: 5, content: 'Best chocolate cake in Addis! My family loved it.', created_at: '2025-04-01T09:15:00Z', customer: { id: 'c3', phone: '+251933333333', full_name: 'Ephrem D.', avatar_url: null, role: 'customer', created_at: '', updated_at: '' } },
];

const MOCK_IMAGES = [
'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a0b?w=600',
'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600',
'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600',
];

export default function ProductPage() {
 const params = useParams<{ slug: string }>();
 const slug = params.slug;
 const { profile } = useAuthStore();
 const addItem = useCartStore((s) => s.addItem);

 const [loading, setLoading] = useState(true);
 const [product, setProduct] = useState<Product | null>(null);
 const [reviews] = useState<Review[]>(MOCK_REVIEWS);
 const [selectedImage, setSelectedImage] = useState(0);
 const [quantity, setQuantity] = useState(1);
 const [isFavorite, setIsFavorite] = useState(false);

 useEffect(() => {
 setLoading(true);
 const timer = setTimeout(() => {
 setProduct({ ...MOCK_PRODUCT, images: MOCK_IMAGES, slug });
 setLoading(false);
 }, 500);
 return () => clearTimeout(timer);
 }, [slug]);

 const handleAddToCart = () => {
 if (!product) return;
 addItem({
 id:`${product.id}-${Date.now()}`,
 product_id: product.id,
 store_id: product.store_id,
 product_name: product.name,
 product_image: product.images?.[0] || null,
 unit_price: product.price,
 quantity,
 notes: '',
 store_name: product.store?.name,
 });
 };

 if (loading) {
 return (
 <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
 <div className="grid gap-8 lg:grid-cols-2">
 <Skeleton variant="rectangular" className="aspect-square w-full rounded-[90px]" />
 <div className="space-y-4">
 <Skeleton variant="text" className="h-8 w-3/4" />
 <Skeleton variant="text" className="h-4 w-full" />
 <Skeleton variant="text" className="h-4 w-2/3" />
 <Skeleton variant="text" className="h-6 w-24" />
 <Skeleton variant="rectangular" className="h-12 w-40 rounded-[90px]" />
 </div>
 </div>
 </div>
 );
 }

 if (!product) {
 notFound();
 }

 const averageRating = reviews.length
 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
 : 0;

 return (
 <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
 <nav className="mb-4 text-sm text-coral-crimson/60">
 <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
 <span className="mx-2">/</span>
 {product.category && (
 <>
 <Link href={`/search?category=${product.category.slug}`} className="hover:text-brand-600 transition-colors">
 {product.category.name}
 </Link>
 <span className="mx-2">/</span>
 </>
 )}
 <span className="text-coral-crimson">{product.name}</span>
 </nav>

 <div className="grid gap-8 lg:grid-cols-2">
 <div className="space-y-3">
 <div className="relative aspect-square overflow-hidden rounded-[90px] bg-coral-crimson/5">
 {product.images[selectedImage] ? (
 <Image
 src={product.images[selectedImage]}
 alt={product.name}
 fill
 className="object-cover"
 sizes="(max-width: 1024px) 100vw, 50vw"
 priority
 />
 ) : (
 <div className="flex h-full items-center justify-center text-coral-crimson/30">
 <svg className="h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
 </svg>
 </div>
 )}
 </div>

 {product.images.length > 1 && (
 <div className="flex gap-2 overflow-x-auto pb-1">
 {product.images.map((img, i) => (
 <button
 key={i}
 type="button"
 onClick={() => setSelectedImage(i)}
 className={cn(
'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[90px] border-2 transition-colors',
 selectedImage === i ? 'border-brand-500' : 'border-coral-crimson/20 hover:border-coral-crimson/30'
 )}
 >
 <Image
 src={img}
 alt={`${product.name} thumbnail ${i + 1}`}
 fill
 className="object-cover"
 sizes="64px"
 />
 </button>
 ))}
 </div>
 )}
 </div>

 <div className="flex flex-col gap-4">
 <div>
 <div className="flex items-start justify-between gap-2">
 <h1 className="font-display text-2xl sm:text-3xl font-bold text-coral-crimson">
 {product.name}
 </h1>

 {profile && (
 <button
 type="button"
 onClick={() => setIsFavorite(!isFavorite)}
 className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[90px] hover:bg-coral-crimson/10 transition-colors"
 aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
 >
 <svg
 className={cn('h-6 w-6', isFavorite ? 'fill-brand-600 text-brand-600' : 'text-coral-crimson/50')}
 fill={isFavorite ? 'currentColor' : 'none'}
 stroke="currentColor"
 viewBox="0 0 24 24"
 strokeWidth={2}
 >
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
 </svg>
 </button>
 )}
 </div>

 <div className="mt-2 flex items-center gap-2">
 <StarRating value={averageRating} readonly size="sm" />
 <span className="text-sm text-coral-crimson/60">
 {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
 </span>
 </div>
 </div>

 <div className="flex items-baseline gap-3">
 <span className="text-3xl font-bold text-coral-crimson">{formatPrice(product.price)}</span>
 {product.compare_at_price && product.compare_at_price > product.price && (
 <span className="text-lg text-coral-crimson/50 line-through">{formatPrice(product.compare_at_price)}</span>
 )}
 </div>

 {product.store && (
 <Link
 href={`/sellers/${product.store.slug}`}
 className="flex items-center gap-3 rounded-[90px] border border-coral-crimson/20 p-3 hover:bg-coral-crimson/5 transition-colors group"
 >
 <Avatar
 src={product.store.logo_url}
 alt={product.store.name}
 size="md"
 fallback={product.store.name}
 />
 <div>
 <p className="text-sm font-medium text-coral-crimson group-hover:text-brand-600 transition-colors">
 {product.store.name}
 </p>
 <div className="flex items-center gap-1 text-xs text-coral-crimson/60">
 <StarRating value={4.5} readonly size="sm" />
 <span>0 reviews</span>
 </div>
 </div>
 <svg className="ml-auto h-5 w-5 text-coral-crimson/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
 </svg>
 </Link>
 )}

 {product.preparation_time_minutes && (
 <div className="flex items-center gap-2 text-sm text-coral-crimson/70">
 <svg className="h-5 w-5 text-coral-crimson/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 Preparation time: ~{product.preparation_time_minutes} minutes
 </div>
 )}

 {product.description && (
 <div className="border-t border-coral-crimson/10 pt-4">
 <h2 className="mb-2 text-sm font-semibold text-coral-crimson">Description</h2>
 <p className="text-sm text-coral-crimson/70 whitespace-pre-line">{product.description}</p>
 </div>
 )}

 <div className="mt-auto flex items-center gap-4 border-t border-coral-crimson/10 pt-4">
 <div className="flex items-center rounded-[90px] border border-coral-crimson/20">
 <button
 type="button"
 onClick={() => setQuantity(Math.max(1, quantity - 1))}
 disabled={quantity <= 1}
 className="flex h-10 w-10 items-center justify-center text-coral-crimson/70 hover:bg-coral-crimson/5 disabled:opacity-30 transition-colors rounded-l-xl"
 aria-label="Decrease quantity"
 >
 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
 </svg>
 </button>
 <span className="flex h-10 w-12 items-center justify-center text-sm font-medium text-coral-crimson border-x border-coral-crimson/20">
 {quantity}
 </span>
 <button
 type="button"
 onClick={() => setQuantity(Math.min(99, quantity + 1))}
 disabled={quantity >= 99}
 className="flex h-10 w-10 items-center justify-center text-coral-crimson/70 hover:bg-coral-crimson/5 disabled:opacity-30 transition-colors rounded-r-xl"
 aria-label="Increase quantity"
 >
 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
 </svg>
 </button>
 </div>

 {product.is_available ? (
 <div className="flex-1">
 <Button variant="primary" size="lg" className="w-full" onClick={handleAddToCart}>
 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
 </svg>
 Add to Cart — {formatPrice(product.price * quantity)}
 </Button>
 </div>
 ) : (
 <div className="flex-1">
 <Button variant="secondary" size="lg" className="w-full" disabled>
 Out of Stock
 </Button>
 </div>
 )}
 </div>

 <div className="flex items-center gap-3 text-xs text-coral-crimson/50">
 <div className="flex items-center gap-1">
 <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 Freshly baked to order
 </div>
 <div className="flex items-center gap-1">
 <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 No preservatives
 </div>
 </div>
 </div>
 </div>

 <section className="mt-12 border-t border-coral-crimson/10 pt-8">
 <h2 className="mb-6 font-display text-xl font-bold text-coral-crimson">
 Reviews ({reviews.length})
 </h2>
 {reviews.length === 0 ? (
 <p className="text-sm text-coral-crimson/60">No reviews yet. Be the first to review this product!</p>
 ) : (
 <div className="space-y-4">
 {reviews.map((review) => (
 <div key={review.id} className="rounded-[90px] border border-coral-crimson/10 p-4">
 <div className="flex items-center gap-3">
 <Avatar
 src={review.customer?.avatar_url}
 alt={review.customer?.full_name || 'Anonymous'}
 size="sm"
 fallback={review.customer?.full_name || 'A'}
 />
 <div>
 <p className="text-sm font-medium text-coral-crimson">
 {review.customer?.full_name || 'Anonymous'}
 </p>
 <div className="flex items-center gap-2">
 <StarRating value={review.rating} readonly size="sm" />
 <span className="text-xs text-coral-crimson/50">{formatDate(review.created_at)}</span>
 </div>
 </div>
 </div>
 {review.content && (
 <p className="mt-2 text-sm text-coral-crimson/70">{review.content}</p>
 )}
 </div>
 ))}
 </div>
 )}
 </section>
 </div>
 );
}

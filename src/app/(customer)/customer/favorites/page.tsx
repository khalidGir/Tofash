'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils/format';
import type { Product } from '@/types/models';

const MOCK_FAVORITES: Product[] = [];

export default function FavoritesPage() {
 const router = useRouter();
 const [loading, setLoading] = useState(true);
 const [favorites, setFavorites] = useState<Product[]>(MOCK_FAVORITES);

 useEffect(() => {
 const timer = setTimeout(() => setLoading(false), 300);
 return () => clearTimeout(timer);
 }, []);

 const handleRemoveFavorite = async (productId: string) => {
 try {
 await fetch('/api/favorites', {
 method: 'DELETE',
 headers: {'Content-Type': 'application/json' },
 body: JSON.stringify({ product_id: productId }),
 });
 setFavorites((prev) => prev.filter((p) => p.id !== productId));
 } catch {
 // handle error
 }
 };

 if (loading) {
 return (
 <div>
 <Skeleton className="mb-6 h-8 w-40" />
 <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
 {[1, 2, 3, 4].map((i) => (
 <Skeleton key={i} className="h-64 rounded-[90px]" />
 ))}
 </div>
 </div>
 );
 }

 if (favorites.length === 0) {
 return (
 <EmptyState
 icon={
 <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 }
 title="No favorites yet"
 description="Save your favorite desserts by tapping the heart icon on any product."
 action={{
 label: 'Browse Desserts',
 onClick: () => router.push('/search'),
 }}
 />
 );
 }

 return (
 <div>
 <h1 className="mb-6 text-2xl font-bold text-coral-crimson">My Favorites</h1>

 <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
 {favorites.map((product) => (
 <button
 key={product.id}
 onClick={() => router.push(`/products/${product.slug}`)}
 className="group relative overflow-hidden rounded-[90px] border border-coral-crimson/10 bg-pure-white transition-shadow text-left"
 >
 <div className="relative aspect-square bg-coral-crimson/5">
 {product.images[0] ? (
 <Image
 src={product.images[0]}
 alt={product.name}
 fill
 className="object-cover transition-transform group-hover:scale-105"
 sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
 />
 ) : (
 <div className="flex h-full items-center justify-center text-coral-crimson/30">
 <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 </div>
 )}

 {/* Heart button */}
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleRemoveFavorite(product.id);
 }}
 className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-pure-white"
 aria-label="Remove from favorites"
 >
 <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
 <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 </button>
 </div>

 <div className="p-3">
 <h3 className="truncate text-sm font-medium text-coral-crimson">
 {product.name}
 </h3>
 <p className="mt-1 text-sm font-semibold text-brand-600">
 {formatPrice(product.price)}
 </p>
 {product.store?.name && (
 <p className="mt-0.5 text-xs text-coral-crimson/60 truncate">
 {product.store.name}
 </p>
 )}
 </div>
 </button>
 ))}
 </div>
 </div>
 );
}

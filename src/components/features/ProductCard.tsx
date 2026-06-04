'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/models';
import { cn } from '@/lib/utils/cn';
import { formatPrice, truncate } from '@/lib/utils/format';
import StarRating from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
 product: Product;
 onAddToCart?: (product: Product) => void;
 onToggleFavorite?: (product: Product) => void;
 isFavorite?: boolean;
 className?: string;
}

export function ProductCard({
 product,
 onAddToCart,
 onToggleFavorite,
 isFavorite = false,
 className,
}: ProductCardProps) {
 const [imageError, setImageError] = useState(false);
 const imageSrc = product.images?.[0] || '/images/placeholder-dessert.svg';

 const averageRating = 4.5;
 const reviewCount = 0;

 return (
 <div
 className={cn(
'group relative flex flex-col rounded-[90px] bg-pure-white transition-shadow',
 className
 )}
 >
 <Link
 href={`/products/${product.slug}`}
 className="relative aspect-square overflow-hidden rounded-t-2xl bg-coral-crimson/5"
 >
 {!imageError ? (
 <Image
 src={imageSrc}
 alt={product.name}
 fill
 sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
 className="object-cover transition-transform duration-300 group-hover:scale-105"
 loading="lazy"
 onError={() => setImageError(true)}
 />
 ) : (
 <div className="flex h-full items-center justify-center text-coral-crimson/50">
 <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 </div>
 )}

 {onToggleFavorite && (
 <button
 type="button"
 onClick={(e) => {
 e.preventDefault();
 onToggleFavorite(product);
 }}
 className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-pure-white"
 aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
 >
 <svg
 className={cn('h-5 w-5', isFavorite ? 'fill-brand-600 text-brand-600' : 'text-coral-crimson/70')}
 fill={isFavorite ? 'currentColor' : 'none'}
 stroke="currentColor"
 viewBox="0 0 24 24"
 strokeWidth={2}
 >
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
 </svg>
 </button>
 )}
 </Link>

 <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
 <Link href={`/products/${product.slug}`}>
 <h3 className="text-sm font-semibold leading-tight text-coral-crimson line-clamp-2">
 {truncate(product.name, 50)}
 </h3>
 </Link>

 {product.store && (
 <Link
 href={`/sellers/${product.store.slug}`}
 className="text-xs text-coral-crimson/60 hover:text-brand-600 transition-colors"
 >
 {product.store.name}
 </Link>
 )}

 <div className="flex items-center gap-1">
 <StarRating value={averageRating} readonly size="sm" />
 {reviewCount > 0 && (
 <span className="text-xs text-coral-crimson/50">({reviewCount})</span>
 )}
 </div>

 <div className="mt-auto flex items-center justify-between pt-2">
 <div className="flex flex-col">
 <span className="text-base font-bold text-coral-crimson">
 {formatPrice(product.price)}
 </span>
 {product.compare_at_price && product.compare_at_price > product.price && (
 <span className="text-xs text-coral-crimson/50 line-through">
 {formatPrice(product.compare_at_price)}
 </span>
 )}
 </div>

 {product.is_available ? (
 <Button
 variant="primary"
 size="sm"
 onClick={(e) => {
 e.preventDefault();
 onAddToCart?.(product);
 }}
 >
 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
 </svg>
 </Button>
 ) : (
 <span className="text-xs font-medium text-red-500">Out of Stock</span>
 )}
 </div>
 </div>
 </div>
 );
}

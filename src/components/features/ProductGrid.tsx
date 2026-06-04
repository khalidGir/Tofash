'use client';

import type { Product } from '@/types/models';
import { cn } from '@/lib/utils/cn';
import { ProductCard } from './ProductCard';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

interface ProductGridProps {
 products: Product[];
 loading?: boolean;
 emptyMessage?: string;
 emptyDescription?: string;
 columns?: 2 | 3 | 4;
 onAddToCart?: (product: Product) => void;
 onToggleFavorite?: (product: Product) => void;
 className?: string;
}

const columnClasses: Record<number, string> = {
 2: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
 3: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4',
 4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
};

export function ProductGrid({
 products,
 loading = false,
 emptyMessage = 'No products found',
 emptyDescription,
 columns = 4,
 onAddToCart,
 onToggleFavorite,
 className,
}: ProductGridProps) {
 if (loading) {
 return (
 <div className={cn('grid gap-4 sm:gap-6', columnClasses[columns], className)}>
 {Array.from({ length: 8 }).map((_, i) => (
 <div key={i} className="flex flex-col gap-3 rounded-[90px] bg-pure-white p-3 sm:p-4">
 <Skeleton variant="rectangular" className="aspect-square w-full rounded-[90px]" />
 <Skeleton variant="text" className="h-4 w-3/4" />
 <Skeleton variant="text" className="h-3 w-1/2" />
 <Skeleton variant="text" className="h-3 w-1/4" />
 <div className="flex items-center justify-between pt-2">
 <Skeleton variant="text" className="h-5 w-16" />
 <Skeleton variant="rectangular" className="h-8 w-8 rounded-[90px]" />
 </div>
 </div>
 ))}
 </div>
 );
 }

 if (products.length === 0) {
 return (
 <EmptyState
 icon={
 <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
 </svg>
 }
 title={emptyMessage}
 description={emptyDescription}
 />
 );
 }

 return (
 <div className={cn('grid gap-4 sm:gap-6', columnClasses[columns], className)}>
 {products.map((product) => (
 <ProductCard
 key={product.id}
 product={product}
 onAddToCart={onAddToCart}
 onToggleFavorite={onToggleFavorite}
 />
 ))}
 </div>
 );
}

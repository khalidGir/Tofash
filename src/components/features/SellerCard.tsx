'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Store } from '@/types/models';
import { cn } from '@/lib/utils/cn';
import StarRating from '@/components/ui/StarRating';
import Badge from '@/components/ui/Badge';

interface SellerCardProps {
 store: Store;
 className?: string;
}

export function SellerCard({ store, className }: SellerCardProps) {
 const averageRating = 4.5;
 const reviewCount = 0;

 return (
 <Link
 href={`/sellers/${store.slug}`}
 className={cn(
'group flex flex-col rounded-[90px] bg-pure-white transition-shadow overflow-hidden',
 className
 )}
 >
 <div className="relative h-24 sm:h-32 bg-gradient-to-br from-coral-crimson/10 to-coral-crimson/10 overflow-hidden">
 {store.banner_url && (
 <Image
 src={store.banner_url}
 alt={`${store.name} banner`}
 fill
 className="object-cover"
 sizes="(max-width: 640px) 100vw, 33vw"
 />
 )}
 </div>

 <div className="relative -mt-8 px-4 pb-4 sm:px-5 sm:pb-5">
 <div className="relative z-10 mb-3 flex items-end gap-3">
 <div className="h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full border-2 border-white bg-coral-crimson/5">
 {store.logo_url ? (
 <Image
 src={store.logo_url}
 alt={store.name}
 width={64}
 height={64}
 className="h-full w-full object-cover"
 />
 ) : (
 <div className="flex h-full w-full items-center justify-center bg-coral-crimson/10 text-brand-700 text-lg font-bold">
 {store.name.charAt(0).toUpperCase()}
 </div>
 )}
 </div>

 {store.is_featured && (
 <Badge variant="brand" size="sm" className="mb-auto">
 Featured
 </Badge>
 )}
 </div>

 <h3 className="text-base font-semibold text-coral-crimson group-hover:text-brand-600 transition-colors">
 {store.name}
 </h3>

 <div className="mt-1 flex items-center gap-1.5">
 <StarRating value={averageRating} readonly size="sm" />
 {reviewCount > 0 && (
 <span className="text-xs text-coral-crimson/50">({reviewCount})</span>
 )}
 </div>

 {store.preparation_time_minutes && (
 <div className="mt-2 flex items-center gap-1 text-xs text-coral-crimson/60">
 <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span>~{store.preparation_time_minutes} min prep</span>
 </div>
 )}
 </div>
 </Link>
 );
}

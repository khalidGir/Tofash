'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Category } from '@/types/models';
import { cn } from '@/lib/utils/cn';

interface CategoryCardProps {
 category: Pick<Category, 'name' |'slug' |'image_url'>;
 className?: string;
}

const CATEGORY_ICONS: Record<string, ReactNode> = {
 cake: (
 <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0zM4 16c0 1.933 1.79 3.5 4 3.5s4-1.567 4-3.5m-8 0c0 1.933-1.79 3.5-4 3.5S.5 17.933.5 16m8 0c0 1.933 1.79 3.5 4 3.5s4-1.567 4-3.5" />
 </svg>
 ),
 cookie: (
 <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
 <circle cx="12" cy="12" r="9" />
 <circle cx="9" cy="9" r="1" fill="currentColor" />
 <circle cx="15" cy="10" r="1" fill="currentColor" />
 <circle cx="11" cy="15" r="1" fill="currentColor" />
 </svg>
 ),
 pastry: (
 <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 5h2v2h-2V7zm0 4h2v6h-2v-6z" />
 </svg>
 ),
 default: (
 <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
 </svg>
 ),
};

export function CategoryCard({ category, className }: CategoryCardProps) {
 const icon = CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default;

 return (
 <Link
 href={`/search?category=${category.slug}`}
 className={cn(
'group relative flex flex-col items-center gap-2 rounded-[90px] bg-pure-white p-4 transition-all hover:-translate-y-0.5',
 className
 )}
 >
 <div className="flex h-16 w-16 items-center justify-center rounded-[90px] bg-coral-crimson/5 text-brand-600 transition-colors group-hover:bg-coral-crimson/10">
 {icon}
 </div>
 <span className="text-sm font-medium text-coral-crimson text-center group-hover:text-brand-600 transition-colors">
 {category.name}
 </span>
 </Link>
 );
}

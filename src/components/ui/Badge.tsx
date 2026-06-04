import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const variants = {
 warm: 'bg-coral-crimson/10 text-brand-700 border-brand-200',
 green: 'bg-green-100 text-green-700 border-green-200',
 red: 'bg-brand-200 text-brand-800 border-brand-300',
 blue: 'bg-blue-100 text-blue-700 border-blue-200',
 gray: 'bg-coral-crimson/5 text-brand-600 border-brand-100',
 brand: 'bg-coral-crimson text-white border-coral-crimson',
} as const;

const sizes = {
 sm: 'px-2 py-0.5 text-xs',
 md: 'px-2.5 py-1 text-sm',
 lg: 'px-3 py-1.5 text-sm',
} as const;

interface BadgeProps {
 variant?: keyof typeof variants;
 size?: keyof typeof sizes;
 children: ReactNode;
 className?: string;
}

export default function Badge({
 variant = 'gray',
 size = 'md',
 children,
 className,
}: BadgeProps) {
 return (
 <span
 className={cn(
'inline-flex items-center rounded-[300px] border font-medium',
 variants[variant],
 sizes[size],
 className
 )}
 >
 {children}
 </span>
 );
}

'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const variants = {
 primary:
'bg-coral-crimson text-white hover:bg-brand-700 focus-visible:ring-coral-crimson',
 secondary:
'bg-pure-white text-coral-crimson border border-coral-crimson/30 hover:bg-blush-paper focus-visible:ring-coral-crimson',
 ghost:
'text-coral-crimson hover:bg-blush-paper focus-visible:ring-coral-crimson',
 danger:
'bg-coral-crimson text-white hover:bg-brand-700 focus-visible:ring-coral-crimson',
};

const sizes = {
 sm: 'px-8 py-1.5 text-sm',
 md: 'px-10 py-2 text-sm',
 lg: 'px-12 py-3 text-base',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: keyof typeof variants;
 size?: keyof typeof sizes;
 loading?: boolean;
 icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
 (
 {
 className,
 variant = 'primary',
 size = 'md',
 loading = false,
 icon,
 children,
 disabled,
 ...props
 },
 ref
 ) => {
 return (
 <button
 ref={ref}
 disabled={disabled || loading}
 className={cn(
'inline-flex items-center justify-center gap-2 rounded-[300px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
 variants[variant],
 sizes[size],
 className
 )}
 {...props}
 >
 {loading ? (
 <svg
 className="h-4 w-4 animate-spin"
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 aria-hidden="true"
 >
 <circle
 className="opacity-25"
 cx="12"
 cy="12"
 r="10"
 stroke="currentColor"
 strokeWidth="4"
 />
 <path
 className="opacity-75"
 fill="currentColor"
 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
 />
 </svg>
 ) : icon ? (
 <span className="shrink-0">{icon}</span>
 ) : null}
 {children}
 </button>
 );
 }
);

Button.displayName = 'Button';

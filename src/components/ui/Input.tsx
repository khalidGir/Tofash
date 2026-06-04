'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
 label?: string;
 error?: string;
 icon?: React.ReactNode;
 helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
 ({ className, label, error, icon, helperText, id, ...props }, ref) => {
 const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

 return (
 <div className="space-y-1.5">
 {label && (
 <label
 htmlFor={inputId}
 className="block text-sm font-medium text-coral-crimson"
 >
 {label}
 </label>
 )}
 <div className="relative">
 {icon && (
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-coral-crimson/50">
 {icon}
 </div>
 )}
 <input
 ref={ref}
 id={inputId}
 className={cn(
'block w-full rounded-[90px] border border-coral-crimson/20 bg-pure-white px-4 py-2.5 text-sm text-coral-crimson placeholder:text-coral-crimson/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors',
 icon && 'pl-10',
 error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
 className
 )}
 aria-invalid={error ? 'true' : 'false'}
 aria-describedby={error ?`${inputId}-error` : undefined}
 {...props}
 />
 </div>
 {error && (
 <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
 {error}
 </p>
 )}
 {helperText && !error && (
 <p className="text-sm text-coral-crimson/60">{helperText}</p>
 )}
 </div>
 );
 }
);

Input.displayName = 'Input';

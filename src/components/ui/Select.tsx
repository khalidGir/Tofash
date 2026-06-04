'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface SelectOption {
 value: string;
 label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
 label?: string;
 error?: string;
 options: SelectOption[];
 placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
 ({ className, label, error, options, placeholder, id, ...props }, ref) => {
 const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

 return (
 <div className="space-y-1.5">
 {label && (
 <label
 htmlFor={selectId}
 className="block text-sm font-medium text-coral-crimson"
 >
 {label}
 </label>
 )}
 <select
 ref={ref}
 id={selectId}
 className={cn(
'block w-full rounded-[90px] border border-coral-crimson/20 bg-pure-white px-4 py-2.5 text-sm text-coral-crimson focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors',
 error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
 className
 )}
 aria-invalid={error ? 'true' : 'false'}
 {...props}
 >
 {placeholder && (
 <option value="" disabled>
 {placeholder}
 </option>
 )}
 {options.map((opt) => (
 <option key={opt.value} value={opt.value}>
 {opt.label}
 </option>
 ))}
 </select>
 {error && (
 <p className="text-sm text-red-600" role="alert">
 {error}
 </p>
 )}
 </div>
 );
 }
);

Select.displayName = 'Select';

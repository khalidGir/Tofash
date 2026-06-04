'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
 onSearch?: (query: string) => void;
 placeholder?: string;
 initialValue?: string;
 navigateOnSubmit?: boolean;
 className?: string;
}

export function SearchBar({
 onSearch,
 placeholder = 'Search desserts, sellers...',
 initialValue = '',
 navigateOnSubmit = true,
 className,
}: SearchBarProps) {
 const router = useRouter();
 const [value, setValue] = useState(initialValue);
 const inputRef = useRef<HTMLInputElement>(null);
 const debouncedValue = useDebounce(value, 300);

 useEffect(() => {
 if (debouncedValue !== initialValue) {
 onSearch?.(debouncedValue);
 }
 }, [debouncedValue, onSearch, initialValue]);

 useEffect(() => {
 setValue(initialValue);
 }, [initialValue]);

 const handleSubmit = useCallback(
 (e: React.FormEvent) => {
 e.preventDefault();
 const trimmed = value.trim();
 if (!trimmed) return;
 if (navigateOnSubmit) {
 router.push(`/search?q=${encodeURIComponent(trimmed)}`);
 }
 onSearch?.(trimmed);
 inputRef.current?.blur();
 },
 [value, navigateOnSubmit, router, onSearch]
 );

 const handleClear = useCallback(() => {
 setValue('');
 onSearch?.('');
 inputRef.current?.focus();
 }, [onSearch]);

 return (
 <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-coral-crimson/50">
 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 </div>

 <input
 ref={inputRef}
 type="text"
 value={value}
 onChange={(e) => setValue(e.target.value)}
 placeholder={placeholder}
 className="block w-full rounded-full border border-coral-crimson/20 bg-pure-white py-2 pl-10 pr-10 text-sm text-coral-crimson placeholder:text-coral-crimson/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
 aria-label="Search"
 />

 {value && (
 <button
 type="button"
 onClick={handleClear}
 className="absolute inset-y-0 right-0 flex items-center pr-3 text-coral-crimson/50 hover:text-coral-crimson/70 transition-colors"
 aria-label="Clear search"
 >
 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 )}
 </form>
 );
}

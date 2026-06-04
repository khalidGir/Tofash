'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
 open: boolean;
 onClose: () => void;
 title?: string;
 size?: 'sm' |'md' |'lg' |'full';
 children: ReactNode;
}

export default function Modal({
 open,
 onClose,
 title,
 size = 'md',
 children,
}: ModalProps) {
 useEffect(() => {
 if (open) {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = '';
 }
 return () => {
 document.body.style.overflow = '';
 };
 }, [open]);

 useEffect(() => {
 const handleEscape = (e: KeyboardEvent) => {
 if (e.key === 'Escape') onClose();
 };
 if (open) {
 document.addEventListener('keydown', handleEscape);
 }
 return () => document.removeEventListener('keydown', handleEscape);
 }, [open, onClose]);

 if (!open) return null;

 const sizes = {
 sm: 'max-w-sm',
 md: 'max-w-lg',
 lg: 'max-w-2xl',
 full: 'max-w-full mx-0 h-full rounded-[90px] rounded-b-none',
 };

 return (
 <div
 className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
 role="dialog"
 aria-modal="true"
 aria-label={title}
 >
 <div
 className="fixed inset-0 bg-black/50 transition-opacity"
 onClick={onClose}
 aria-hidden="true"
 />
 <div
 className={cn(
'relative z-10 w-full bg-pure-white animate-slide-up sm:animate-slide-down sm:rounded-[90px]',
 sizes[size]
 )}
 >
 <div className="flex items-center justify-between border-b border-coral-crimson/10 px-4 py-3 sm:px-6">
 {title && (
 <h2 className="text-lg font-semibold text-coral-crimson">{title}</h2>
 )}
 <button
 onClick={onClose}
 className="ml-auto rounded-[90px] p-1.5 text-coral-crimson/50 hover:bg-coral-crimson/10 hover:text-coral-crimson/70 transition-colors"
 aria-label="Close modal"
 >
 <svg
 className="h-5 w-5"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M6 18L18 6M6 6l12 12"
 />
 </svg>
 </button>
 </div>
 <div className="overflow-y-auto p-4 sm:p-6 max-h-[80vh]">{children}</div>
 </div>
 </div>
 );
}

'use client';

import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/lib/stores/uiStore';

const iconMap = {
 success: (
 <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 ),
 error: (
 <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 ),
 info: (
 <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 ),
};

const bgMap = {
 success: 'bg-green-50 border-green-200',
 error: 'bg-red-50 border-red-200',
 info: 'bg-blue-50 border-blue-200',
};

export default function ToastContainer() {
 const toasts = useUIStore((s) => s.toasts);
 const removeToast = useUIStore((s) => s.removeToast);

 if (toasts.length === 0) return null;

 return (
 <div
 className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
 aria-live="polite"
 aria-label="Notifications"
 >
 {toasts.map((toast) => (
 <div
 key={toast.id}
 className={cn(
'flex items-start gap-3 rounded-[90px] border p-4 animate-slide-down',
 bgMap[toast.type]
 )}
 role="alert"
 >
 <span className="shrink-0 mt-0.5">{iconMap[toast.type]}</span>
 <p className="text-sm text-coral-crimson flex-1">{toast.message}</p>
 <button
 onClick={() => removeToast(toast.id)}
 className="shrink-0 text-coral-crimson/50 hover:text-coral-crimson/70 transition-colors"
 aria-label="Dismiss"
 >
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 ))}
 </div>
 );
}

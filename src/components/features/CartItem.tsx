'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';
import type { CartItem as CartItemType } from '@/types/models';

interface CartItemProps {
 item: CartItemType;
 onUpdateQuantity: (productId: string, quantity: number) => void;
 onRemove: (productId: string) => void;
 onUpdateNotes: (productId: string, notes: string) => void;
}

export default function CartItem({
 item,
 onUpdateQuantity,
 onRemove,
 onUpdateNotes,
}: CartItemProps) {
 const [notesExpanded, setNotesExpanded] = useState(false);
 const [confirmRemove, setConfirmRemove] = useState(false);

 const subtotal = item.unit_price * item.quantity;

 const handleRemove = () => {
 if (confirmRemove) {
 onRemove(item.product_id);
 } else {
 setConfirmRemove(true);
 setTimeout(() => setConfirmRemove(false), 3000);
 }
 };

 return (
 <div className="flex gap-4 rounded-[90px] border border-coral-crimson/10 bg-pure-white p-4">
 <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[90px] bg-coral-crimson/5">
 {item.product_image ? (
 <Image
 src={item.product_image}
 alt={item.product_name}
 fill
 className="object-cover"
 sizes="80px"
 />
 ) : (
 <div className="flex h-full items-center justify-center text-coral-crimson/50">
 <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 </div>
 )}
 </div>

 <div className="flex min-w-0 flex-1 flex-col gap-2">
 <div className="flex items-start justify-between gap-2">
 <div className="min-w-0">
 <h3 className="truncate text-sm font-medium text-coral-crimson">
 {item.product_name}
 </h3>
 {item.store_name && (
 <p className="text-xs text-coral-crimson/60">{item.store_name}</p>
 )}
 <p className="mt-0.5 text-sm text-coral-crimson">
 {formatPrice(item.unit_price)} each
 </p>
 </div>
 <button
 onClick={handleRemove}
 className={cn(
'shrink-0 rounded-[90px] p-1.5 transition-colors',
 confirmRemove
 ? 'bg-red-100 text-red-600'
 : 'text-coral-crimson/50 hover:bg-red-50 hover:text-red-500'
 )}
 aria-label={confirmRemove ? 'Confirm remove' : 'Remove item'}
 >
 {confirmRemove ? (
 <span className="text-xs font-medium px-1">Confirm</span>
 ) : (
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
 </svg>
 )}
 </button>
 </div>

 <div className="flex items-center gap-3">
 <div className="flex items-center rounded-[90px] border border-coral-crimson/20">
 <button
 onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
 disabled={item.quantity <= 1}
 className="flex h-8 w-8 items-center justify-center text-coral-crimson/70 hover:bg-coral-crimson/5 disabled:opacity-40 transition-colors rounded-l-lg"
 aria-label="Decrease quantity"
 >
 <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
 </svg>
 </button>
 <span className="flex h-8 w-10 items-center justify-center text-sm font-medium text-coral-crimson tabular-nums">
 {item.quantity}
 </span>
 <button
 onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
 className="flex h-8 w-8 items-center justify-center text-coral-crimson/70 hover:bg-coral-crimson/5 transition-colors rounded-r-lg"
 aria-label="Increase quantity"
 >
 <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 </button>
 </div>
 <p className="ml-auto text-sm font-semibold text-coral-crimson">
 {formatPrice(subtotal)}
 </p>
 </div>

 <div>
 <button
 onClick={() => setNotesExpanded(!notesExpanded)}
 className="flex items-center gap-1 text-xs text-coral-crimson/60 hover:text-coral-crimson transition-colors"
 >
 <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
 </svg>
 {item.notes ? 'Edit notes' : 'Add notes'}
 </button>
 {notesExpanded && (
 <textarea
 value={item.notes}
 onChange={(e) => onUpdateNotes(item.product_id, e.target.value)}
 placeholder="Any special instructions?"
 rows={2}
 className="mt-2 w-full rounded-[90px] border border-coral-crimson/20 bg-pure-white px-3 py-2 text-sm text-coral-crimson placeholder:text-coral-crimson/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors resize-none"
 />
 )}
 </div>
 </div>
 </div>
 );
}

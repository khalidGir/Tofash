'use client';

import { cn } from '@/lib/utils/cn';
import { ORDER_STATUS } from '@/lib/utils/constants';
import { formatDateTime } from '@/lib/utils/format';
import type { OrderStatus } from '@/lib/utils/constants';

interface TimelineStep {
 status: OrderStatus;
 label: string;
 timestamp: string | null;
}

const STEPS: TimelineStep[] = [
 { status: ORDER_STATUS.PENDING_PAYMENT, label: 'Order Placed', timestamp: null },
 { status: ORDER_STATUS.PENDING_VERIFICATION, label: 'Payment Submitted', timestamp: null },
 { status: ORDER_STATUS.ACCEPTED, label: 'Accepted', timestamp: null },
 { status: ORDER_STATUS.COMPLETED, label: 'Completed', timestamp: null },
];

interface OrderTimelineProps {
 currentStatus: OrderStatus;
 timestamps: {
 created_at?: string | null;
 paid_at?: string | null;
 completed_at?: string | null;
 };
}

export default function OrderTimeline({ currentStatus, timestamps }: OrderTimelineProps) {
 const statusOrder = Object.values(ORDER_STATUS);
 const currentIdx = statusOrder.indexOf(currentStatus);

 const steps = STEPS.map((step) => {
 let timestamp: string | null = null;
 if (step.status === ORDER_STATUS.PENDING_PAYMENT) timestamp = timestamps.created_at ?? null;
 else if (step.status === ORDER_STATUS.PENDING_VERIFICATION) timestamp = timestamps.paid_at ?? null;
 else if (step.status === ORDER_STATUS.COMPLETED) timestamp = timestamps.completed_at ?? null;
 return { ...step, timestamp };
 });

 return (
 <div className="space-y-4">
 {steps.map((step, idx) => {
 const isCompleted = currentIdx >= statusOrder.indexOf(step.status);
 const isCurrent = currentIdx === statusOrder.indexOf(step.status);
 return (
 <div key={step.status} className="flex items-start gap-3">
 <div className="flex flex-col items-center">
 <div
 className={cn(
'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
 isCompleted
 ? 'border-green-500 bg-green-500 text-white'
 : isCurrent
 ? 'border-brand-500 bg-coral-crimson/10 text-brand-600'
 : 'border-coral-crimson/30 bg-pure-white text-coral-crimson/50'
 )}
 >
 {isCompleted ? '\u2713' : idx + 1}
 </div>
 {idx < steps.length - 1 && (
 <div
 className={cn(
'mt-1 h-8 w-0.5',
 isCompleted ? 'bg-green-500' : 'bg-gray-200'
 )}
 />
 )}
 </div>
 <div className="min-w-0 pt-0.5">
 <p
 className={cn(
'text-sm font-medium',
 isCompleted ? 'text-green-700' : isCurrent ? 'text-brand-700' : 'text-coral-crimson/60'
 )}
 >
 {step.label}
 </p>
 {step.timestamp && (
 <p className="text-xs text-coral-crimson/50">{formatDateTime(step.timestamp)}</p>
 )}
 </div>
 </div>
 );
 })}
 </div>
 );
}

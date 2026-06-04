'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import Card from '@/components/ui/Card';

interface StatsCardProps {
 title: string;
 value: string | number;
 icon: ReactNode;
 trend?: {
 direction: 'up' |'down';
 value: string;
 };
 className?: string;
}

export default function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
 return (
 <Card className={cn('flex items-start gap-4', className)}>
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[90px] bg-coral-crimson/10 text-brand-600">
 {icon}
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-sm text-coral-crimson/60">{title}</p>
 <p className="mt-1 text-2xl font-semibold text-coral-crimson">{value}</p>
 {trend && (
 <p
 className={cn(
'mt-1 text-sm',
 trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
 )}
 >
 <span>
 {trend.direction === 'up' ? '\u2191' : '\u2193'} {trend.value}
 </span>
 </p>
 )}
 </div>
 </Card>
 );
}

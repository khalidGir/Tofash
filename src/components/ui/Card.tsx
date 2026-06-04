import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
 padding?: boolean;
 hover?: boolean;
 children: ReactNode;
}

export default function Card({
 className,
 padding = true,
 hover = false,
 children,
 ...props
}: CardProps) {
 return (
 <div
 className={cn(
'rounded-[90px] bg-pure-white',
 padding && 'p-6 sm:p-8',
 hover && 'transition-opacity hover:opacity-90',
 className
 )}
 {...props}
 >
 {children}
 </div>
 );
}

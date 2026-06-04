import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
 variant?: 'text' |'circular' |'rectangular';
 className?: string;
}

export default function Skeleton({
 variant = 'text',
 className,
}: SkeletonProps) {
 return (
 <div
 className={cn(
'animate-pulse bg-gray-200',
 variant === 'text' && 'h-4 w-full rounded-md',
 variant === 'circular' && 'rounded-full',
 variant === 'rectangular' && 'rounded-[90px]',
 className
 )}
 aria-hidden="true"
 />
 );
}

import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
 src?: string | null;
 alt?: string;
 size?: 'sm' |'md' |'lg' |'xl';
 fallback?: string;
}

const sizes = {
 sm: 'h-8 w-8 text-xs',
 md: 'h-10 w-10 text-sm',
 lg: 'h-12 w-12 text-base',
 xl: 'h-16 w-16 text-lg',
};

export default function Avatar({
 src,
 alt = '',
 size = 'md',
 fallback,
 className,
 ...props
}: AvatarProps) {
 const initials = fallback
 ? fallback
 .split('')
 .map((n) => n[0])
 .join('')
 .toUpperCase()
 .slice(0, 2)
 : '? ';

 if (src) {
 return (
 <img
 src={src}
 alt={alt}
 className={cn('rounded-full object-cover', sizes[size], className)}
 {...(props as HTMLAttributes<HTMLImageElement>)}
 />
 );
 }

 return (
 <div
 className={cn(
'flex items-center justify-center rounded-full bg-coral-crimson/10 text-brand-700 font-medium',
 sizes[size],
 className
 )}
 aria-label={alt || fallback}
 {...props}
 >
 {initials}
 </div>
 );
}

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface StarRatingProps {
 value: number;
 onChange?: (value: number) => void;
 readonly?: boolean;
 size?: 'sm' |'md' |'lg';
 className?: string;
}

const sizes = {
 sm: 'h-4 w-4',
 md: 'h-5 w-5',
 lg: 'h-6 w-6',
};

export default function StarRating({
 value,
 onChange,
 readonly = false,
 size = 'md',
 className,
}: StarRatingProps) {
 const [hovered, setHovered] = useState(0);

 const stars = [1, 2, 3, 4, 5];

 const handleClick = (star: number) => {
 if (!readonly && onChange) {
 onChange(star);
 }
 };

 return (
 <div
 className={cn('flex items-center gap-0.5', className)}
 role={readonly ? 'img' : 'radiogroup'}
 aria-label={`Rating: ${value} out of 5 stars`}
 >
 {stars.map((star) => {
 const filled = star <= (hovered || value);
 return (
 <button
 key={star}
 type="button"
 disabled={readonly}
 onClick={() => handleClick(star)}
 onMouseEnter={() => !readonly && setHovered(star)}
 onMouseLeave={() => !readonly && setHovered(0)}
 className={cn(
'transition-colors',
 readonly ? 'cursor-default' : 'cursor-pointer'
 )}
 aria-label={`${star} star${star !== 1 ? 's' : ''}`}
 role={readonly ? undefined : 'radio'}
 aria-checked={readonly ? undefined : star === value}
 tabIndex={readonly ? -1 : 0}
 >
 <svg
 className={cn(sizes[size], 'transition-colors')}
 fill={filled ? 'currentColor' : 'none'}
 stroke="currentColor"
 viewBox="0 0 24 24"
 strokeWidth={1.5}
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
 />
 </svg>
 </button>
 );
 })}
 </div>
 );
}

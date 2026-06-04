import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

interface EmptyStateProps {
 icon?: ReactNode;
 title: string;
 description?: string;
 action?: {
 label: string;
 onClick: () => void;
 };
 className?: string;
}

export default function EmptyState({
 icon,
 title,
 description,
 action,
 className,
}: EmptyStateProps) {
 return (
 <div
 className={cn(
'flex flex-col items-center justify-center py-12 px-4 text-center',
 className
 )}
 >
 {icon && (
 <div className="mb-4 text-coral-crimson/30">{icon}</div>
 )}
 <h3 className="text-lg font-semibold text-coral-crimson">{title}</h3>
 {description && (
 <p className="mt-1 text-sm text-coral-crimson/60 max-w-sm">{description}</p>
 )}
 {action && (
 <Button
 variant="primary"
 size="sm"
 className="mt-4"
 onClick={action.onClick}
 >
 {action.label}
 </Button>
 )}
 </div>
 );
}

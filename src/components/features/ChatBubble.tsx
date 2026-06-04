import { cn } from '@/lib/utils/cn';
import { formatDateTime } from '@/lib/utils/format';
import type { Message } from '@/types/models';

interface ChatBubbleProps {
 message: Message;
 isOwn: boolean;
 showSender?: boolean;
}

export default function ChatBubble({
 message,
 isOwn,
 showSender = false,
}: ChatBubbleProps) {
 return (
 <div
 className={cn(
'flex flex-col max-w-[80%] ',
 isOwn ? 'items-end self-end' : 'items-start self-start'
 )}
 >
 {showSender && !isOwn && (
 <p className="mb-1 text-xs font-medium text-coral-crimson/60">Seller</p>
 )}
 <div
 className={cn(
'rounded-[90px] px-4 py-2.5 text-sm leading-relaxed',
 isOwn
 ? 'bg-brand-600 text-white rounded-br-md'
 : 'bg-coral-crimson/5 text-coral-crimson rounded-bl-md'
 )}
 >
 {message.content}
 {message.image_url && (
 <img
 src={message.image_url}
 alt="Shared image"
 className="mt-2 max-w-full rounded-[90px]"
 />
 )}
 </div>
 <div className="mt-0.5 flex items-center gap-1.5">
 <span className="text-[10px] text-coral-crimson/50">
 {formatDateTime(message.created_at)}
 </span>
 {isOwn && (
 <span className={cn('text-[10px] ', message.read_at ? 'text-blue-500' : 'text-coral-crimson/30')}>
 {message.read_at ? 'Read' : 'Sent'}
 </span>
 )}
 </div>
 </div>
 );
}

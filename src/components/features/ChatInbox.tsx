'use client';

import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils/cn';
import { timeAgo } from '@/lib/utils/format';
import type { Chat } from '@/types/models';

interface ChatInboxProps {
 chats: Chat[];
 currentUserId: string;
}

export default function ChatInbox({ chats, currentUserId }: ChatInboxProps) {
 const router = useRouter();

 if (chats.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center py-12 text-center">
 <svg className="h-12 w-12 text-coral-crimson/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
 </svg>
 <p className="mt-4 text-sm font-medium text-coral-crimson">No conversations yet</p>
 <p className="mt-1 text-sm text-coral-crimson/60">
 Messages from your orders will appear here
 </p>
 </div>
 );
 }

 return (
 <div className="divide-y divide-gray-100">
 {chats.map((chat) => {
 const otherPartyName = chat.order?.store?.name || 'Store';
 const lastMsg = chat.last_message;
 const isUnread = lastMsg && lastMsg.sender_id !== currentUserId && !lastMsg.read_at;
 const lastMsgPreview = lastMsg
 ? lastMsg.content
 : 'No messages yet';

 return (
 <button
 key={chat.id}
 onClick={() => router.push(`/customer/chat/${chat.id}`)}
 className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-coral-crimson/5"
 >
 <Avatar
 size="md"
 fallback={otherPartyName}
 />
 <div className="min-w-0 flex-1">
 <div className="flex items-center justify-between gap-2">
 <p className={cn(
'truncate text-sm',
 isUnread ? 'font-semibold text-coral-crimson' : 'font-medium text-coral-crimson'
 )}>
 {otherPartyName}
 </p>
 {lastMsg && (
 <span className="shrink-0 text-xs text-coral-crimson/50">
 {timeAgo(lastMsg.created_at)}
 </span>
 )}
 </div>
 <p className={cn(
'truncate text-sm',
 isUnread ? 'font-medium text-coral-crimson' : 'text-coral-crimson/60'
 )}>
 {lastMsgPreview}
 </p>
 </div>
 {isUnread && (
 <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />
 )}
 </button>
 );
 })}
 </div>
 );
}

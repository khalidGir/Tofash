'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { formatDate, timeAgo, truncate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Chat } from '@/types/models';

const supabase = createClient();

export default function SellerChatPage() {
 const { profile } = useAuthStore();
 const [search, setSearch] = useState('');
 const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

 const { data: chats, isLoading } = useQuery({
 queryKey: ['seller-chats', profile?.id],
 queryFn: async () => {
 const { data } = await supabase
 .from('chats')
 .select('*, last_message:messages(*), order:orders(*) ')
 .eq('seller_id', profile!.id)
 .order('updated_at', { ascending: false });
 return (data ?? []) as Chat[];
 },
 enabled: !!profile?.id,
 });

 const filtered = useMemo(() => {
 if (!chats) return [];
 if (!search.trim()) return chats;
 const q = search.toLowerCase();
 return chats.filter((c) => {
 const orderNum = c.order?.order_number?.toLowerCase() ?? '';
 return orderNum.includes(q);
 });
 }, [chats, search]);

 if (isLoading) {
 return (
 <div className="space-y-3">
 <Skeleton variant="rectangular" className="h-8 w-48" />
 {Array.from({ length: 5 }).map((_, i) => (
 <Skeleton key={i} variant="rectangular" className="h-20" />
 ))}
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <h1 className="text-2xl font-bold text-coral-crimson">Chat Inbox</h1>

 <Input
 placeholder="Search by order number..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="max-w-xs"
 icon={
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 }
 />

 {filtered.length > 0 ? (
 <div className="space-y-2">
 {filtered.map((chat) => {
 const unread = chat.last_message && !chat.last_message.read_at && chat.last_message.sender_id !== profile!.id;
 const isSelected = selectedChat?.id === chat.id;

 return (
 <div key={chat.id}>
 <button
 onClick={() => setSelectedChat(isSelected ? null : chat)}
 className={cn(
'w-full text-left rounded-[90px] transition-colors',
 isSelected ? 'bg-coral-crimson/5 ring-1 ring-brand-200' : 'hover:bg-coral-crimson/5'
 )}
 >
  <Card padding={false}>
 <div className="flex items-start gap-3 p-4">
 <div
 className={cn(
'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium',
 unread ? 'bg-brand-600 text-white' : 'bg-coral-crimson/5 text-coral-crimson/70'
 )}
 >
 #{chat.order?.order_number?.slice(-2) ?? '? '}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between gap-2">
 <p className={cn('text-sm', unread ? 'font-semibold text-coral-crimson' : 'font-medium text-coral-crimson')}>
 Order #{chat.order?.order_number ?? 'N/A'}
 </p>
 <span className="text-xs text-coral-crimson/50 shrink-0">
 {chat.last_message ? timeAgo(chat.last_message.created_at) : formatDate(chat.created_at)}
 </span>
 </div>
 <p className={cn('text-sm mt-0.5', unread ? 'font-medium text-coral-crimson' : 'text-coral-crimson/60')}>
 {chat.last_message ? truncate(chat.last_message.content, 60) : 'No messages yet'}
 </p>
 </div>
 {unread && (
 <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600 mt-1.5" />
 )}
 </div>
 </Card>
 </button>

 {/* Expanded chat conversation */}
 {isSelected && (
 <div className="ml-12 mt-2 mb-4 border-l-2 border-brand-200 pl-4 space-y-3">
 <ExpandedChat chatId={chat.id} profileId={profile!.id} />
 </div>
 )}
 </div>
 );
 })}
 </div>
 ) : (
 <EmptyState
 title={search ? 'No chats match your search' : 'No conversations yet'}
 description={search ? 'Try a different search term.' : 'When customers message you about an order, conversations will appear here.'}
 />
 )}
 </div>
 );
}

function ExpandedChat({ chatId, profileId }: { chatId: string; profileId: string }) {
 const { data: messages, isLoading } = useQuery({
 queryKey: ['chat-messages', chatId],
 queryFn: async () => {
 const { data } = await supabase
 .from('messages')
 .select('*')
 .eq('chat_id', chatId)
 .order('created_at', { ascending: true });
 return data ?? [];
 },
 enabled: !!chatId,
 });

 if (isLoading) {
 return (
 <div className="space-y-2">
 <Skeleton variant="text" />
 <Skeleton variant="text" className="w-3/4" />
 <Skeleton variant="text" className="w-1/2" />
 </div>
 );
 }

 if (!messages || messages.length === 0) {
 return (
 <p className="text-sm text-coral-crimson/50 italic">No messages in this conversation yet.</p>
 );
 }

 return (
 <div className="space-y-3 max-h-64 overflow-y-auto">
 {messages.map((msg) => {
 const isOwn = msg.sender_id === profileId;
 return (
 <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
 <div
 className={cn(
'max-w-xs rounded-[90px] px-4 py-2 text-sm',
 isOwn
 ? 'bg-brand-600 text-white rounded-br-md'
 : 'bg-coral-crimson/5 text-coral-crimson rounded-bl-md'
 )}
 >
 <p>{msg.content}</p>
 <p className={cn('text-xs mt-1', isOwn ? 'text-brand-200' : 'text-coral-crimson/50')}>
 {formatDate(msg.created_at)}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 );
}

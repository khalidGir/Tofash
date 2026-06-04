'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { ROUTES } from '@/lib/utils/constants';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ChatBubble from '@/components/features/ChatBubble';
import type { Chat, Message } from '@/types/models';

const supabase = createClient();

export default function CustomerChatPage() {
 const params = useParams<{ id: string }>();
 const router = useRouter();
 const queryClient = useQueryClient();
 const { profile } = useAuthStore();
 const addToast = useUIStore((s) => s.addToast);
 const [input, setInput] = useState('');
 const [sending, setSending] = useState(false);
 const messagesEndRef = useRef<HTMLDivElement>(null);

 const { data: chat, isLoading } = useQuery({
 queryKey: ['customer-chat', params.id],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('chats')
 .select('*, order:orders(order_number), messages(*) ')
 .eq('id', params.id)
 .order('created_at', { foreignTable: 'messages', ascending: true })
 .single();
 if (error) throw error;
 return data as unknown as Chat & { messages: Message[] };
 },
 });

 // Real-time subscription
 useEffect(() => {
 const channel = supabase
 .channel(`chat-${params.id}`)
 .on(
'postgres_changes',
 {
 event: 'INSERT',
 schema: 'public',
 table: 'messages',
 filter:`chat_id=eq.${params.id}`,
 },
 () => {
 queryClient.invalidateQueries({ queryKey: ['customer-chat', params.id] });
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [params.id, queryClient]);

 // Mark unread messages as read
 useEffect(() => {
 if (!chat?.messages || !profile?.id) return;
 const unreadIds = chat.messages
 .filter((m) => m.sender_id !== profile.id && !m.read_at)
 .map((m) => m.id);
 if (unreadIds.length === 0) return;
 supabase
 .from('messages')
 .update({ read_at: new Date().toISOString() })
 .in('id', unreadIds)
 .then(() => queryClient.invalidateQueries({ queryKey: ['customer-chat', params.id] }));
 }, [chat?.messages, profile?.id, params.id, queryClient]);

 // Auto-scroll
 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [chat?.messages]);

 const handleSend = async () => {
 const trimmed = input.trim();
 if (!trimmed || sending) return;
 setSending(true);
 try {
 const { error } = await supabase.from('messages').insert({
 chat_id: params.id,
 sender_id: profile!.id,
 content: trimmed,
 });
 if (error) throw error;
 setInput('');
 queryClient.invalidateQueries({ queryKey: ['customer-chat', params.id] });
 } catch (err) {
 addToast({ type: 'error', message: 'Failed to send message' });
 } finally {
 setSending(false);
 }
 };

 if (isLoading) {
 return (
 <div className="flex flex-col h-[calc(100vh-12rem)]">
 <div className="space-y-3 p-4">
 <Skeleton variant="rectangular" className="h-10 w-48" />
 <Skeleton variant="rectangular" className="flex-1" />
 </div>
 </div>
 );
 }

 if (!chat) {
 return (
 <EmptyState
 icon={
 <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 }
 title="Chat not found"
 description="This conversation may have been deleted."
 action={{ label: 'Back to Chats', onClick: () => router.push(ROUTES.CUSTOMER.CHAT) }}
 />
 );
 }

 const messages = chat.messages ?? [];
 const orderNumber = (chat.order as any)?.order_number;

 return (
 <div className="flex flex-col h-[calc(100vh-12rem)]">
 {/* Header */}
 <div className="flex items-center gap-3 px-4 py-3 border-b border-coral-crimson/10 bg-pure-white rounded-t-2xl">
 <Link
 href={ROUTES.CUSTOMER.CHAT}
 className="text-coral-crimson/50 hover:text-coral-crimson/70 transition-colors"
 >
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
 </svg>
 </Link>
 <div>
 <p className="font-medium text-coral-crimson">
 {orderNumber ?`Order #${orderNumber}` : 'Chat'}
 </p>
 <p className="text-xs text-coral-crimson/60">{chat.order?.store?.name ?? 'Seller'}</p>
 </div>
 </div>

 {/* Messages */}
 <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
 {messages.length > 0 ? (
 messages.map((msg) => (
 <ChatBubble
 key={msg.id}
 message={msg}
 isOwn={msg.sender_id === profile?.id}
 showSender
 />
 ))
 ) : (
 <div className="flex items-center justify-center h-full">
 <p className="text-sm text-coral-crimson/50">No messages yet. Start the conversation!</p>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Input */}
 <div className="border-t border-coral-crimson/10 bg-pure-white p-4 rounded-b-2xl">
 <div className="flex items-center gap-2">
 <input
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 handleSend();
 }
 }}
 placeholder="Type your message..."
 className="flex-1 rounded-[90px] border border-coral-crimson/20 bg-blush-paper px-4 py-2.5 text-sm text-coral-crimson placeholder:text-coral-crimson/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
 />
 <Button
 onClick={handleSend}
 loading={sending}
 disabled={!input.trim()}
 size="md"
 >
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
 </svg>
 </Button>
 </div>
 </div>
 </div>
 );
}

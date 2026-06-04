'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils/format';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { useUIStore } from '@/lib/stores/uiStore';
import { cn } from '@/lib/utils/cn';

interface Dispute {
 id: string;
 order_id: string;
 order_number?: string;
 reason: string;
 description: string | null;
 status: 'open' |'resolved' |'dismissed';
 created_at: string;
 updated_at: string;
}

const supabase = createClient();

const TABS = [
 { label: 'All', value: 'all' },
 { label: 'Open', value: 'open' },
 { label: 'Resolved', value: 'resolved' },
 { label: 'Dismissed', value: 'dismissed' },
] as const;

export default function AdminDisputesPage() {
 const queryClient = useQueryClient();
 const addToast = useUIStore((s) => s.addToast);
 const [activeTab, setActiveTab] = useState('all');
 const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
 const [resolutionNote, setResolutionNote] = useState('');

 const { data: disputes, isLoading } = useQuery({
 queryKey: ['admin-disputes'],
 queryFn: async () => {
 const { data } = await supabase
 .from('disputes')
 .select('*')
 .order('created_at', { ascending: false });
 return (data ?? []) as Dispute[];
 },
 });

 const resolveMutation = useMutation({
 mutationFn: async ({ id, status, note }: { id: string; status: 'resolved' |'dismissed'; note?: string }) => {
 const { error } = await supabase
 .from('disputes')
 .update({ status, updated_at: new Date().toISOString(), resolution_note: note || null })
 .eq('id', id);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
 addToast({ type: 'success', message: 'Dispute updated' });
 setSelectedDispute(null);
 setResolutionNote('');
 },
 onError: (err) => {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update dispute' });
 },
 });

 const filtered = useMemo(() => {
 if (!disputes) return [];
 if (activeTab === 'all') return disputes;
 return disputes.filter((d) => d.status === activeTab);
 }, [disputes, activeTab]);

 return (
 <div className="space-y-6">
 <h1 className="text-2xl font-bold text-coral-crimson">Disputes</h1>

 {/* Tabs */}
 <div className="flex gap-1 overflow-x-auto pb-1">
 {TABS.map((tab) => (
 <button
 key={tab.value}
 onClick={() => setActiveTab(tab.value)}
 className={cn(
'whitespace-nowrap rounded-[90px] px-4 py-2 text-sm font-medium transition-colors',
 activeTab === tab.value
 ? 'bg-brand-600 text-white'
 : 'bg-pure-white text-coral-crimson/70 hover:bg-coral-crimson/5 border border-coral-crimson/20'
 )}
 >
 {tab.label}
 {tab.value !== 'all' && disputes && (
 <span className="ml-1.5 text-xs opacity-70">
 ({disputes.filter((d) => d.status === tab.value).length})
 </span>
 )}
 </button>
 ))}
 </div>

 {isLoading ? (
 <div className="space-y-3">
 {Array.from({ length: 4 }).map((_, i) => (
 <Skeleton key={i} variant="rectangular" className="h-20" />
 ))}
 </div>
 ) : filtered.length > 0 ? (
 <div className="space-y-3">
 {filtered.map((dispute) => (
 <Card key={dispute.id}>
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <span className="font-medium text-coral-crimson">Order #{dispute.order_number ?? dispute.order_id.slice(0, 8)}</span>
 <Badge
 variant={dispute.status === 'open' ? 'red' : dispute.status === 'resolved' ? 'green' : 'gray'}
 size="sm"
 >
 {dispute.status}
 </Badge>
 </div>
 <p className="text-sm text-coral-crimson mt-1">{dispute.reason}</p>
 {dispute.description && (
 <p className="text-sm text-coral-crimson/60 mt-1">{dispute.description}</p>
 )}
 </div>
 <div className="text-right shrink-0">
 <p className="text-xs text-coral-crimson/50">{formatDate(dispute.created_at)}</p>
 {dispute.status === 'open' && (
 <Button
 size="sm"
 className="mt-2"
 onClick={() => setSelectedDispute(dispute)}
 >
 Review
 </Button>
 )}
 </div>
 </div>
 </Card>
 ))}
 </div>
 ) : (
 <EmptyState
 title="No disputes"
 description="No disputes have been reported."
 />
 )}

 {/* Review Dispute Modal */}
 <Modal
 open={!!selectedDispute}
 onClose={() => { setSelectedDispute(null); setResolutionNote(''); }}
 title="Review Dispute"
 >
 <div className="space-y-4">
 <div className="rounded-[90px] bg-blush-paper p-4 text-sm space-y-2">
 <p><span className="text-coral-crimson/60">Reason:</span> {selectedDispute?.reason}</p>
 {selectedDispute?.description && (
 <p><span className="text-coral-crimson/60">Description:</span> {selectedDispute.description}</p>
 )}
 </div>

 <Input
 label="Resolution Note"
 placeholder="Add a note about the resolution..."
 value={resolutionNote}
 onChange={(e) => setResolutionNote(e.target.value)}
 />

 <div className="flex gap-3">
 <Button
 variant="primary"
 loading={resolveMutation.isPending}
 onClick={() =>
 selectedDispute &&
 resolveMutation.mutate({ id: selectedDispute.id, status: 'resolved', note: resolutionNote })
 }
 >
 Resolve
 </Button>
 <Button
 variant="ghost"
 loading={resolveMutation.isPending}
 onClick={() =>
 selectedDispute &&
 resolveMutation.mutate({ id: selectedDispute.id, status: 'dismissed', note: resolutionNote })
 }
 >
 Dismiss
 </Button>
 <Button variant="ghost" onClick={() => { setSelectedDispute(null); setResolutionNote(''); }}>
 Cancel
 </Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}

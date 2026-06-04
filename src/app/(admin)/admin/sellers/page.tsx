'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '@/lib/utils/constants';
import { formatDate, formatPhone } from '@/lib/utils/format';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils/cn';
import type { SellerApplication } from '@/types/models';

const supabase = createClient();

const TABS = [
 { label: 'All', value: 'all' },
 { label: 'Pending', value: 'pending' },
 { label: 'Approved', value: 'approved' },
 { label: 'Rejected', value: 'rejected' },
 { label: 'Suspended', value: 'suspended' },
] as const;

export default function AdminSellersPage() {
 const [activeTab, setActiveTab] = useState<string>('all');
 const [search, setSearch] = useState('');

 const { data: applications, isLoading } = useQuery({
 queryKey: ['admin-seller-applications'],
 queryFn: async () => {
 const { data } = await supabase
 .from('seller_applications')
 .select('*')
 .order('created_at', { ascending: false });
 return (data ?? []) as SellerApplication[];
 },
 });

 const filtered = useMemo(() => {
 if (!applications) return [];
 let result = applications;

 if (activeTab !== 'all') {
 result = result.filter((a) => a.status === activeTab);
 }

 if (search.trim()) {
 const q = search.toLowerCase();
 result = result.filter(
 (a) =>
 a.full_name.toLowerCase().includes(q) ||
 a.phone.includes(q) ||
 a.store_name.toLowerCase().includes(q)
 );
 }

 return result;
 }, [applications, activeTab, search]);

 const pendingCount = applications?.filter((a) => a.status === 'pending').length ?? 0;

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-coral-crimson">Seller Applications</h1>
 {pendingCount > 0 && (
 <p className="text-sm text-coral-crimson/70 mt-1">{pendingCount} pending application{pendingCount !== 1 ? 's' : ''}</p>
 )}
 </div>
 <Input
 placeholder="Search name, phone, store..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="max-w-xs"
 icon={
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 }
 />
 </div>

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
 {tab.value !== 'all' && applications && (
 <span className="ml-1.5 text-xs opacity-70">
 ({applications.filter((a) => a.status === tab.value).length})
 </span>
 )}
 </button>
 ))}
 </div>

 {isLoading ? (
 <div className="space-y-3">
 {Array.from({ length: 5 }).map((_, i) => (
 <Skeleton key={i} variant="rectangular" className="h-16" />
 ))}
 </div>
 ) : filtered.length > 0 ? (
 <div className="space-y-3">
 {filtered.map((app) => (
 <Link key={app.id} href={`${ROUTES.ADMIN.SELLERS}/${app.id}`}>
 <Card
 hover
 className={cn(
'flex items-center gap-4',
 app.status === 'pending' && 'ring-2 ring-warm-300'
 )}
 >
 <div
 className={cn(
'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium',
 app.status === 'pending' ? 'bg-coral-crimson/10 text-coral-crimson' :
 app.status === 'approved' ? 'bg-green-100 text-green-700' :
'bg-coral-crimson/5 text-coral-crimson/70'
 )}
 >
 {app.full_name.charAt(0).toUpperCase()}
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-medium text-coral-crimson">{app.full_name}</p>
 <p className="text-sm text-coral-crimson/60">{app.store_name} &middot; {formatPhone(app.phone)}</p>
 </div>
 <div className="text-right">
 <Badge
 variant={app.status === 'approved' ? 'green' : app.status === 'rejected' ? 'red' : 'warm'}
 size="sm"
 >
 {app.status}
 </Badge>
 <p className="text-xs text-coral-crimson/50 mt-1">{formatDate(app.created_at)}</p>
 </div>
 </Card>
 </Link>
 ))}
 </div>
 ) : (
 <EmptyState
 title={search ? 'No results match your search' : 'No applications yet'}
 description={search ? 'Try a different search term.' : 'Seller applications will appear here when users apply.'}
 />
 )}
 </div>
 );
}

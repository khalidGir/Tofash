'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/lib/stores/uiStore';
import { ROUTES } from '@/lib/utils/constants';
import { formatDate, formatPhone } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import type { SellerApplication, Store } from '@/types/models';

const supabase = createClient();

interface OrderRecord {
 id: string;
 order_number: string;
 status: string;
 total_amount: number;
 created_at: string;
}

export default function AdminSellerDetailPage() {
 const params = useParams<{ sellerId: string }>();
 const router = useRouter();
 const queryClient = useQueryClient();
 const addToast = useUIStore((s) => s.addToast);

 const [actionModal, setActionModal] = useState<{ action: string; label: string } | null>(null);
 const [actionLoading, setActionLoading] = useState(false);

 const { data: application, isLoading: appLoading } = useQuery({
 queryKey: ['admin-seller-application', params.sellerId],
 queryFn: async () => {
 const { data } = await supabase
 .from('seller_applications')
 .select('*')
 .eq('id', params.sellerId)
 .single();
 if (!data) throw new Error('Application not found');
 return data as SellerApplication;
 },
 });

 const { data: store } = useQuery({
 queryKey: ['admin-seller-store', application?.user_id],
 queryFn: async () => {
 const { data } = await supabase
 .from('stores')
 .select('*')
 .eq('seller_id', application!.user_id)
 .maybeSingle();
 return data as Store | null;
 },
 enabled: !!application && application.status === 'approved',
 });

 const { data: orders } = useQuery({
 queryKey: ['admin-seller-orders', application?.user_id],
 queryFn: async () => {
 if (!store) return [];
 const { data } = await supabase
 .from('orders')
 .select('id, order_number, status, total_amount, created_at')
 .eq('store_id', store.id)
 .order('created_at', { ascending: false });
 return (data ?? []) as OrderRecord[];
 },
 enabled: !!store,
 });

 const handleAction = async () => {
 if (!actionModal || !application) return;
 setActionLoading(true);
 try {
 const updates: Partial<SellerApplication> = {};
 if (actionModal.action === 'approve') updates.status = 'approved';
 else if (actionModal.action === 'reject') updates.status = 'rejected';

 const { error } = await supabase
 .from('seller_applications')
 .update(updates)
 .eq('id', application.id);

 if (error) throw error;

 if (actionModal.action === 'approve') {
 const { error: storeError } = await supabase.from('stores').insert({
 seller_id: application.user_id,
 name: application.store_name,
 slug: application.store_name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
 is_active: true,
 is_featured: false,
 });
 if (storeError) throw storeError;
 }

 addToast({ type: 'success', message:`Application ${actionModal.action === 'approve' ? 'approved' : 'rejected'} successfully` });
 queryClient.invalidateQueries({ queryKey: ['admin-seller-application', application.id] });
 queryClient.invalidateQueries({ queryKey: ['admin-seller-applications'] });
 setActionModal(null);
 } catch (err) {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Action failed' });
 } finally {
 setActionLoading(false);
 }
 };

 if (appLoading) {
 return (
 <div className="space-y-4">
 <Skeleton variant="rectangular" className="h-8 w-48" />
 <Skeleton variant="rectangular" className="h-48" />
 </div>
 );
 }

 if (!application) {
 return (
 <EmptyState
 icon={
 <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 }
 title="Application not found"
 description="This seller application may have been deleted."
 action={{ label: 'Back to Sellers', onClick: () => router.push(ROUTES.ADMIN.SELLERS) }}
 />
 );
 }

 return (
 <div className="space-y-6">
 {/* Back button */}
 <Link
 href={ROUTES.ADMIN.SELLERS}
 className="inline-flex items-center gap-1.5 text-sm text-coral-crimson/60 hover:text-coral-crimson transition-colors"
 >
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
 </svg>
 Back to Sellers
 </Link>

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-coral-crimson">{application.full_name}</h1>
 <p className="text-sm text-coral-crimson/60 mt-1">Applied {formatDate(application.created_at)}</p>
 </div>
 <Badge
 variant={application.status === 'approved' ? 'green' : application.status === 'rejected' ? 'red' : 'warm'}
 size="lg"
 className="capitalize"
 >
 {application.status}
 </Badge>
 </div>

 {/* Details */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 space-y-6">
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">Personal Information</h2>
 <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <dt className="text-xs font-medium text-coral-crimson/60 uppercase tracking-wider">Full Name</dt>
 <dd className="mt-1 text-sm text-coral-crimson">{application.full_name}</dd>
 </div>
 <div>
 <dt className="text-xs font-medium text-coral-crimson/60 uppercase tracking-wider">Phone</dt>
 <dd className="mt-1 text-sm text-coral-crimson">{formatPhone(application.phone)}</dd>
 </div>
 <div>
 <dt className="text-xs font-medium text-coral-crimson/60 uppercase tracking-wider">Store Name</dt>
 <dd className="mt-1 text-sm text-coral-crimson">{application.store_name}</dd>
 </div>
 <div>
 <dt className="text-xs font-medium text-coral-crimson/60 uppercase tracking-wider">Location</dt>
 <dd className="mt-1 text-sm text-coral-crimson">{application.location}</dd>
 </div>
 </dl>
 </Card>

 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">Payment Details</h2>
 <p className="text-sm text-coral-crimson whitespace-pre-wrap">{application.payment_info}</p>
 </Card>

 {application.id_document_url && (
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">Government ID</h2>
 <a
 href={application.id_document_url}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
 >
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 View ID Document
 </a>
 </Card>
 )}

 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">Social Links</h2>
 {Object.keys(application.social_links).length > 0 ? (
 <div className="space-y-2">
 {Object.entries(application.social_links).map(([key, value]) => (
 <div key={key} className="flex items-center gap-2">
 <span className="text-sm font-medium text-coral-crimson/60 capitalize">{key}:</span>
 <a
 href={String(value)}
 target="_blank"
 rel="noopener noreferrer"
 className="text-sm text-brand-600 hover:text-brand-700 truncate"
 >
 {String(value)}
 </a>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-coral-crimson/50">No social links provided.</p>
 )}
 </Card>

 {/* Store Info (if approved) */}
 {store && (
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">Linked Store</h2>
 <div className="flex items-center gap-3">
 <div className="flex h-12 w-12 items-center justify-center rounded-[90px] bg-coral-crimson/10 text-brand-700 font-bold text-lg">
 {store.name.charAt(0).toUpperCase()}
 </div>
 <div>
 <p className="font-medium text-coral-crimson">{store.name}</p>
 <p className="text-sm text-coral-crimson/60">
 {store.is_active ? 'Active' : 'Inactive'}
 {store.is_featured && ' · Featured'}
 </p>
 </div>
 </div>
 </Card>
 )}

 {/* Order History */}
 <Card>
 <h2 className="text-lg font-semibold text-coral-crimson mb-4">Order History</h2>
 {orders && orders.length > 0 ? (
 <div className="space-y-2">
 {orders.map((order) => (
 <Link
 key={order.id}
 href={`${ROUTES.ADMIN.ORDERS}/${order.id}`}
 className="flex items-center justify-between rounded-[90px] border border-coral-crimson/10 px-4 py-3 hover:bg-coral-crimson/5 transition-colors"
 >
 <div>
 <p className="text-sm font-medium text-coral-crimson">#{order.order_number}</p>
 <p className="text-xs text-coral-crimson/60">{formatDate(order.created_at)}</p>
 </div>
 <div className="text-right">
 <p className="text-sm font-semibold text-coral-crimson">{order.total_amount} ETB</p>
 <Badge size="sm" variant={order.status === 'completed' ? 'green' : order.status === 'rejected' ? 'red' : 'warm'}>
 {order.status.replace(/_/g, '')}
 </Badge>
 </div>
 </Link>
 ))}
 </div>
 ) : (
 <p className="text-sm text-coral-crimson/50">No orders yet.</p>
 )}
 </Card>
 </div>

 {/* Actions sidebar */}
 <div className="space-y-4">
 {application.status === 'pending' && (
 <Card>
 <h2 className="text-sm font-semibold text-coral-crimson mb-3">Actions</h2>
 <div className="space-y-2">
 <Button
 className="w-full"
 variant="primary"
 onClick={() => setActionModal({ action: 'approve', label: 'approve this seller application' })}
 >
 Approve Application
 </Button>
 <Button
 className="w-full"
 variant="danger"
 onClick={() => setActionModal({ action: 'reject', label: 'reject this seller application' })}
 >
 Reject Application
 </Button>
 </div>
 </Card>
 )}
 {application.status === 'approved' && (
 <Card>
 <h2 className="text-sm font-semibold text-coral-crimson mb-3">Manage</h2>
 <Button
 className="w-full"
 variant="danger"
 onClick={async () => {
 try {
 const { error } = await supabase
 .from('stores')
 .update({ is_active: false })
 .eq('seller_id', application.user_id);
 if (error) throw error;
 addToast({ type: 'success', message: 'Seller suspended' });
 queryClient.invalidateQueries({ queryKey: ['admin-seller-store', application.user_id] });
 } catch (err) {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to suspend' });
 }
 }}
 >
 Suspend Seller
 </Button>
 </Card>
 )}
 </div>
 </div>

 {/* Confirmation Modal */}
 <Modal
 open={!!actionModal}
 onClose={() => !actionLoading && setActionModal(null)}
 title="Confirm Action"
 size="sm"
 >
 <p className="text-sm text-coral-crimson/70">
 Are you sure you want to <strong>{actionModal?.label}</strong>?
 </p>
 <div className="mt-6 flex items-center gap-3 justify-end">
 <Button variant="secondary" onClick={() => setActionModal(null)} disabled={actionLoading}>
 Cancel
 </Button>
 <Button
 variant={actionModal?.action === 'approve' ? 'primary' : 'danger'}
 loading={actionLoading}
 onClick={handleAction}
 >
 Confirm
 </Button>
 </div>
 </Modal>
 </div>
 );
}

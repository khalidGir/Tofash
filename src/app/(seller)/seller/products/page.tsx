'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { ROUTES } from '@/lib/utils/constants';
import { formatPrice } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { useUIStore } from '@/lib/stores/uiStore';
import type { Product } from '@/types/models';

const supabase = createClient();

export default function SellerProductsPage() {
 const { profile } = useAuthStore();
 const queryClient = useQueryClient();
 const addToast = useUIStore((s) => s.addToast);
 const [search, setSearch] = useState('');
 const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

 const { data: products, isLoading } = useQuery({
 queryKey: ['seller-products', profile?.id],
 queryFn: async () => {
 const { data: store } = await supabase
 .from('stores')
 .select('id')
 .eq('seller_id', profile!.id)
 .single();
 if (!store) return [];

 const { data } = await supabase
 .from('products')
 .select('*')
 .eq('store_id', store.id)
 .order('created_at', { ascending: false });
 return (data ?? []) as Product[];
 },
 enabled: !!profile?.id,
 });

 const toggleAvailability = useMutation({
 mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
 const { error } = await supabase
 .from('products')
 .update({ is_available })
 .eq('id', id);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['seller-products'] });
 addToast({ type: 'success', message: 'Product availability updated' });
 },
 onError: (err) => {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Update failed' });
 },
 });

 const deleteProduct = useMutation({
 mutationFn: async (id: string) => {
 const { error } = await supabase.from('products').delete().eq('id', id);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['seller-products'] });
 addToast({ type: 'success', message: 'Product deleted' });
 setDeleteTarget(null);
 },
 onError: (err) => {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Delete failed' });
 },
 });

 const filtered = useMemo(() => {
 if (!products) return [];
 if (!search.trim()) return products;
 const q = search.toLowerCase();
 return products.filter((p) => p.name.toLowerCase().includes(q));
 }, [products, search]);

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <h1 className="text-2xl font-bold text-coral-crimson">Products</h1>
 <Link href={ROUTES.SELLER.PRODUCTS + '/new'}>
 <Button icon={
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 }>
 Add Product
 </Button>
 </Link>
 </div>

 {/* Search */}
 <Input
 placeholder="Search products..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="max-w-xs"
 icon={
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 }
 />

 {/* Product grid */}
 {isLoading ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {Array.from({ length: 6 }).map((_, i) => (
 <Skeleton key={i} variant="rectangular" className="h-52" />
 ))}
 </div>
 ) : filtered.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {filtered.map((product) => (
 <Card key={product.id} className="flex flex-col">
 {/* Image */}
 <div className="relative h-40 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 mb-4 rounded-t-2xl overflow-hidden bg-coral-crimson/5">
 {product.images?.[0] ? (
 <img
 src={product.images[0]}
 alt={product.name}
 className="h-full w-full object-cover"
 />
 ) : (
 <div className="flex h-full items-center justify-center text-coral-crimson/30">
 <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 </div>
 )}
 {!product.is_available && (
 <div className="absolute inset-0 flex items-center justify-center bg-black/40">
 <span className="rounded-full bg-pure-white px-3 py-1 text-sm font-medium text-coral-crimson">
 Unavailable
 </span>
 </div>
 )}
 </div>

 <div className="flex-1">
 <h3 className="font-medium text-coral-crimson truncate">{product.name}</h3>
 <p className="text-lg font-semibold text-brand-600 mt-1">{formatPrice(product.price)}</p>
 {product.compare_at_price && product.compare_at_price > product.price && (
 <p className="text-sm text-coral-crimson/50 line-through">{formatPrice(product.compare_at_price)}</p>
 )}
 </div>

 {/* Actions */}
 <div className="flex items-center justify-between mt-4 pt-3 border-t border-coral-crimson/10">
 <label className="flex items-center gap-2 text-xs text-coral-crimson/60 cursor-pointer">
 <input
 type="checkbox"
 checked={product.is_available}
 onChange={() =>
 toggleAvailability.mutate({ id: product.id, is_available: !product.is_available })
 }
 className="h-4 w-4 rounded border-coral-crimson/30 text-brand-600 focus:ring-brand-500"
 />
 Available
 </label>
 <div className="flex items-center gap-1">
 <Link href={`${ROUTES.SELLER.PRODUCTS}/${product.id}/edit`}>
 <Button variant="ghost" size="sm">
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
 </svg>
 </Button>
 </Link>
 <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(product)}>
 <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
 </svg>
 </Button>
 </div>
 </div>
 </Card>
 ))}
 </div>
 ) : (
 <EmptyState
 title={search ? 'No products match your search' : 'No products yet'}
 description={search ? 'Try a different search term.' : 'Add your first product to start selling.'}
 action={search ? undefined : { label: 'Add Product', onClick: () => window.location.href = ROUTES.SELLER.PRODUCTS + '/new' }}
 />
 )}

 {/* Delete Modal */}
 <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product">
 <div className="space-y-4">
 <p className="text-sm text-coral-crimson/70">
 Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
 </p>
 <div className="flex gap-3">
 <Button
 variant="danger"
 loading={deleteProduct.isPending}
 onClick={() => deleteTarget && deleteProduct.mutate(deleteTarget.id)}
 >
 Delete
 </Button>
 <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
 Cancel
 </Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}

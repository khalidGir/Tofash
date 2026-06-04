'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate, formatPrice } from '@/lib/utils/format';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { useUIStore } from '@/lib/stores/uiStore';
import type { Product, Category } from '@/types/models';

const supabase = createClient();

export default function AdminProductsPage() {
 const queryClient = useQueryClient();
 const addToast = useUIStore((s) => s.addToast);
 const [search, setSearch] = useState('');
 const [categoryFilter, setCategoryFilter] = useState('all');
 const [removeTarget, setRemoveTarget] = useState<Product | null>(null);

 const { data: products, isLoading: productsLoading } = useQuery({
 queryKey: ['admin-products'],
 queryFn: async () => {
 const { data } = await supabase
 .from('products')
 .select('*, store:stores(*), category:categories(*) ')
 .order('created_at', { ascending: false });
 return (data ?? []) as Product[];
 },
 });

 const { data: categories } = useQuery({
 queryKey: ['categories'],
 queryFn: async () => {
 const { data } = await supabase.from('categories').select('*').order('name');
 return (data ?? []) as Category[];
 },
 });

 const toggleActive = useMutation({
 mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
 const { error } = await supabase
 .from('products')
 .update({ is_available })
 .eq('id', id);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['admin-products'] });
 addToast({ type: 'success', message: 'Product updated' });
 },
 onError: (err) => {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Update failed' });
 },
 });

 const removeProduct = useMutation({
 mutationFn: async (id: string) => {
 const { error } = await supabase.from('products').delete().eq('id', id);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['admin-products'] });
 addToast({ type: 'success', message: 'Product removed' });
 setRemoveTarget(null);
 },
 onError: (err) => {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Remove failed' });
 },
 });

 const filtered = useMemo(() => {
 if (!products) return [];
 let result = products;

 if (categoryFilter !== 'all') {
 result = result.filter((p) => p.category_id === categoryFilter);
 }

 if (search.trim()) {
 const q = search.toLowerCase();
 result = result.filter(
 (p) =>
 p.name.toLowerCase().includes(q) ||
 p.store?.name?.toLowerCase().includes(q)
 );
 }

 return result;
 }, [products, search, categoryFilter]);

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <h1 className="text-2xl font-bold text-coral-crimson">Product Moderation</h1>
 <div className="flex gap-3">
 <Input
 placeholder="Search product or store..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="max-w-xs"
 icon={
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 }
 />
 <Select
 options={[
 { value: 'all', label: 'All Categories' },
 ...(categories?.map((c) => ({ value: c.id, label: c.name })) ?? []),
 ]}
 value={categoryFilter}
 onChange={(e) => setCategoryFilter(e.target.value)}
 className="w-44"
 />
 </div>
 </div>

 {productsLoading ? (
 <div className="space-y-3">
 {Array.from({ length: 5 }).map((_, i) => (
 <Skeleton key={i} variant="rectangular" className="h-20" />
 ))}
 </div>
 ) : filtered.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-coral-crimson/20 text-left">
 <th className="pb-3 font-medium text-coral-crimson/60">Product</th>
 <th className="pb-3 font-medium text-coral-crimson/60">Store</th>
 <th className="pb-3 font-medium text-coral-crimson/60">Price</th>
 <th className="pb-3 font-medium text-coral-crimson/60">Category</th>
 <th className="pb-3 font-medium text-coral-crimson/60">Status</th>
 <th className="pb-3 font-medium text-coral-crimson/60">Date</th>
 <th className="pb-3 font-medium text-coral-crimson/60">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {filtered.map((product) => (
 <tr key={product.id} className="hover:bg-coral-crimson/5 transition-colors">
 <td className="py-3 pr-4">
 <div className="flex items-center gap-3">
 {product.images?.[0] && (
 <img src={product.images[0]} alt="" className="h-10 w-10 rounded-[90px] object-cover" />
 )}
 <span className="font-medium text-coral-crimson">{product.name}</span>
 </div>
 </td>
 <td className="py-3 pr-4 text-coral-crimson/70">{product.store?.name ?? 'N/A'}</td>
 <td className="py-3 pr-4 font-medium text-coral-crimson">{formatPrice(product.price)}</td>
 <td className="py-3 pr-4 text-coral-crimson/70">{product.category?.name ?? 'N/A'}</td>
 <td className="py-3 pr-4">
 <label className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={product.is_available}
 onChange={() => toggleActive.mutate({ id: product.id, is_available: !product.is_available })}
 className="h-4 w-4 rounded border-coral-crimson/30 text-brand-600 focus:ring-brand-500"
 />
 <span className="text-xs text-coral-crimson/60">{product.is_available ? 'Active' : 'Inactive'}</span>
 </label>
 </td>
 <td className="py-3 pr-4 text-coral-crimson/50 text-xs">{formatDate(product.created_at)}</td>
 <td className="py-3">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setRemoveTarget(product)}
 className="text-red-500 hover:text-red-700"
 >
 Remove
 </Button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : (
 <EmptyState
 title={search || categoryFilter !== 'all' ? 'No products match your filters' : 'No products yet'}
 description="Products from all sellers will appear here."
 />
 )}

 {/* Remove Product Modal */}
 <Modal open={!!removeTarget} onClose={() => setRemoveTarget(null)} title="Remove Product">
 <div className="space-y-4">
 <p className="text-sm text-coral-crimson/70">
 Are you sure you want to remove <strong>{removeTarget?.name}</strong>? This action cannot be undone.
 </p>
 <div className="flex gap-3">
 <Button
 variant="danger"
 loading={removeProduct.isPending}
 onClick={() => removeTarget && removeProduct.mutate(removeTarget.id)}
 >
 Remove
 </Button>
 <Button variant="ghost" onClick={() => setRemoveTarget(null)}>
 Cancel
 </Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}

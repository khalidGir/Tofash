'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { ROUTES, SUPABASE_STORAGE_BUCKETS } from '@/lib/utils/constants';
import { ProductForm } from '@/components/features/ProductForm';
import { Button } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import type { Category, Product } from '@/types/models';
import type { ProductFormData } from '@/lib/validations/product';

const supabase = createClient();

export default function EditProductPage() {
 const params = useParams<{ id: string }>();
 const router = useRouter();
 const queryClient = useQueryClient();
 const { profile } = useAuthStore();
 const addToast = useUIStore((s) => s.addToast);
 const [deleteModal, setDeleteModal] = useState(false);
 const [deleteLoading, setDeleteLoading] = useState(false);

 const { data: product, isLoading: productLoading } = useQuery({
 queryKey: ['seller-product', params.id],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('products')
 .select('*')
 .eq('id', params.id)
 .single();
 if (error) throw error;
 return data as Product;
 },
 });

 const { data: categories, isLoading: catLoading } = useQuery({
 queryKey: ['categories'],
 queryFn: async () => {
 const { data } = await supabase.from('categories').select('*').order('name');
 return (data ?? []) as Category[];
 },
 });

 const handleSubmit = async (data: ProductFormData) => {
 try {
 let imageUrls = product?.images ?? [];

 // Upload new images
 const newFiles = data.images.filter((f) => f instanceof File);
 if (newFiles.length > 0) {
 const uploadedUrls: string[] = [];
 for (const file of newFiles) {
 const path =`${profile!.id}/${Date.now()}-${file.name}`;
 const { error: uploadError } = await supabase.storage
 .from(SUPABASE_STORAGE_BUCKETS.PRODUCT_IMAGES)
 .upload(path, file);
 if (uploadError) throw uploadError;
 const { data: urlData } = supabase.storage
 .from(SUPABASE_STORAGE_BUCKETS.PRODUCT_IMAGES)
 .getPublicUrl(path);
 uploadedUrls.push(urlData.publicUrl);
 }
 // Keep old string URLs, replace with new uploads
 const oldImageUrls = (product?.images ?? []).filter((img) => typeof img === 'string' && !img.startsWith('blob: '));
 imageUrls = [...oldImageUrls, ...uploadedUrls];
 }

 const { error } = await supabase
 .from('products')
 .update({
 name: data.name,
 category_id: data.category_id,
 description: data.description || null,
 price: data.price,
 compare_at_price: data.compare_at_price || null,
 images: imageUrls,
 is_available: data.is_available,
 preparation_time_minutes: data.preparation_time_minutes || null,
 })
 .eq('id', params.id);

 if (error) throw error;

 addToast({ type: 'success', message: 'Product updated successfully' });
 queryClient.invalidateQueries({ queryKey: ['seller-product', params.id] });
 queryClient.invalidateQueries({ queryKey: ['seller-products'] });
 router.push(ROUTES.SELLER.PRODUCTS);
 } catch (err) {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update product' });
 }
 };

 const handleDelete = async () => {
 setDeleteLoading(true);
 try {
 const { error } = await supabase.from('products').delete().eq('id', params.id);
 if (error) throw error;
 addToast({ type: 'success', message: 'Product deleted' });
 queryClient.invalidateQueries({ queryKey: ['seller-products'] });
 router.push(ROUTES.SELLER.PRODUCTS);
 } catch (err) {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete product' });
 } finally {
 setDeleteLoading(false);
 setDeleteModal(false);
 }
 };

 if (productLoading || catLoading) {
 return (
 <div className="space-y-4">
 <Skeleton variant="rectangular" className="h-8 w-48" />
 <Skeleton variant="rectangular" className="h-96" />
 </div>
 );
 }

 if (!product) {
 return (
 <EmptyState
 icon={
 <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 }
 title="Product not found"
 description="This product may have been deleted."
 action={{ label: 'Back to Products', onClick: () => router.push(ROUTES.SELLER.PRODUCTS) }}
 />
 );
 }

 const initialData: Partial<ProductFormData> = {
 name: product.name,
 description: product.description ?? '',
 price: product.price,
 compare_at_price: product.compare_at_price ?? undefined,
 category_id: product.category_id ?? '',
 is_available: product.is_available,
 preparation_time_minutes: product.preparation_time_minutes ?? undefined,
 images: [],
 };

 return (
 <div className="max-w-2xl mx-auto space-y-6">
 <div className="flex items-center justify-between">
 <h1 className="text-2xl font-bold text-coral-crimson">Edit Product</h1>
 <Button variant="ghost" onClick={() => router.push(ROUTES.SELLER.PRODUCTS)}>
 Cancel
 </Button>
 </div>

 <ProductForm
 categories={categories ?? []}
 initialData={initialData}
 onSubmit={handleSubmit}
 />

 <Card className="border-red-200">
 <h2 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h2>
 <p className="text-sm text-coral-crimson/70 mb-4">
 Once you delete a product, it cannot be recovered.
 </p>
 <Button variant="danger" onClick={() => setDeleteModal(true)}>
 Delete Product
 </Button>
 </Card>

 {/* Delete Confirmation Modal */}
 <Modal open={deleteModal} onClose={() => !deleteLoading && setDeleteModal(false)} title="Delete Product" size="sm">
 <p className="text-sm text-coral-crimson/70">
 Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
 </p>
 <div className="mt-6 flex items-center gap-3 justify-end">
 <Button variant="secondary" onClick={() => setDeleteModal(false)} disabled={deleteLoading}>
 Cancel
 </Button>
 <Button variant="danger" loading={deleteLoading} onClick={handleDelete}>
 Delete
 </Button>
 </div>
 </Modal>
 </div>
 );
}

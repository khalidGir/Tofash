'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { ROUTES, SUPABASE_STORAGE_BUCKETS } from '@/lib/utils/constants';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ProductForm } from '@/components/features/ProductForm';
import { useUIStore } from '@/lib/stores/uiStore';
import Skeleton from '@/components/ui/Skeleton';
import type { Category } from '@/types/models';
import type { ProductFormData } from '@/lib/validations/product';

const supabase = createClient();

export default function NewProductPage() {
 const router = useRouter();
 const { profile } = useAuthStore();
 const addToast = useUIStore((s) => s.addToast);

 const { data: categories, isLoading } = useQuery({
 queryKey: ['categories'],
 queryFn: async () => {
 const { data } = await supabase.from('categories').select('*').order('name');
 return (data ?? []) as Category[];
 },
 });

 const handleSubmit = async (data: ProductFormData) => {
 try {
 const { data: store } = await supabase
 .from('stores')
 .select('id')
 .eq('seller_id', profile!.id)
 .single();

 if (!store) throw new Error('No store found. Please set up your store first.');

 // Upload images
 const imageUrls: string[] = [];
 for (const file of data.images) {
 const path =`${profile!.id}/${Date.now()}-${file.name}`;
 const { error: uploadError } = await supabase.storage
 .from(SUPABASE_STORAGE_BUCKETS.PRODUCT_IMAGES)
 .upload(path, file);

 if (uploadError) throw uploadError;

 const { data: urlData } = supabase.storage
 .from(SUPABASE_STORAGE_BUCKETS.PRODUCT_IMAGES)
 .getPublicUrl(path);

 imageUrls.push(urlData.publicUrl);
 }

 // Create product
 const { error: productError } = await supabase.from('products').insert({
 store_id: store.id,
 category_id: data.category_id,
 name: data.name,
 description: data.description || null,
 price: data.price,
 compare_at_price: data.compare_at_price || null,
 images: imageUrls,
 is_available: data.is_available,
 preparation_time_minutes: data.preparation_time_minutes || null,
 });

 if (productError) throw productError;

 addToast({ type: 'success', message: 'Product created successfully' });
 router.push(ROUTES.SELLER.PRODUCTS);
 } catch (err) {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to create product' });
 }
 };

 if (isLoading) {
 return (
 <div className="space-y-4">
 <Skeleton variant="rectangular" className="h-8 w-48" />
 <Skeleton variant="rectangular" className="h-96" />
 </div>
 );
 }

 return (
 <div className="max-w-2xl mx-auto space-y-6">
 <h1 className="text-2xl font-bold text-coral-crimson">Add Product</h1>
 <ProductForm categories={categories ?? []} onSubmit={handleSubmit} />
 </div>
 );
}

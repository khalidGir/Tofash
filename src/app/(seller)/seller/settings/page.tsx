'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { SUPABASE_STORAGE_BUCKETS } from '@/lib/utils/constants';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { StoreSettingsForm } from '@/components/features/StoreSettingsForm';
import { useUIStore } from '@/lib/stores/uiStore';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { Store } from '@/types/models';
import type { StoreSettingsFormData } from '@/lib/validations/seller';

const supabase = createClient();

export default function SellerSettingsPage() {
 const { profile } = useAuthStore();
 const addToast = useUIStore((s) => s.addToast);

 const { data: store, isLoading } = useQuery({
 queryKey: ['my-store', profile?.id],
 queryFn: async () => {
 const { data } = await supabase
 .from('stores')
 .select('*')
 .eq('seller_id', profile!.id)
 .single();
 return data as Store | null;
 },
 enabled: !!profile?.id,
 });

 const handleSubmit = async (data: StoreSettingsFormData) => {
 try {
 let logoUrl = store?.logo_url;
 let bannerUrl = store?.banner_url;

 if (data.logo) {
 const path =`logos/${profile!.id}/${Date.now()}-${data.logo.name}`;
 const { error: uploadError } = await supabase.storage
 .from(SUPABASE_STORAGE_BUCKETS.AVATARS)
 .upload(path, data.logo);
 if (uploadError) throw uploadError;
 const { data: urlData } = supabase.storage
 .from(SUPABASE_STORAGE_BUCKETS.AVATARS)
 .getPublicUrl(path);
 logoUrl = urlData.publicUrl;
 }

 if (data.banner) {
 const path =`banners/${profile!.id}/${Date.now()}-${data.banner.name}`;
 const { error: uploadError } = await supabase.storage
 .from(SUPABASE_STORAGE_BUCKETS.PRODUCT_IMAGES)
 .upload(path, data.banner);
 if (uploadError) throw uploadError;
 const { data: urlData } = supabase.storage
 .from(SUPABASE_STORAGE_BUCKETS.PRODUCT_IMAGES)
 .getPublicUrl(path);
 bannerUrl = urlData.publicUrl;
 }

 const { error } = await supabase
 .from('stores')
 .update({
 name: data.name,
 description: data.description || null,
 preparation_time_minutes: data.preparation_time_minutes || null,
 logo_url: logoUrl,
 banner_url: bannerUrl,
 })
 .eq('seller_id', profile!.id);

 if (error) throw error;

 addToast({ type: 'success', message: 'Store settings updated' });
 } catch (err) {
 addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update settings' });
 }
 };

 if (isLoading) {
 return (
 <div className="max-w-2xl mx-auto space-y-4">
 <Skeleton variant="rectangular" className="h-8 w-48" />
 <Skeleton variant="rectangular" className="h-96" />
 </div>
 );
 }

 if (!store) {
 return (
 <EmptyState
 title="No store found"
 description="You need to create a store first."
 />
 );
 }

 const initialData: Partial<StoreSettingsFormData> = {
 name: store.name,
 description: store.description ?? '',
 preparation_time_minutes: store.preparation_time_minutes ?? undefined,
 };

 return (
 <div className="max-w-2xl mx-auto space-y-6">
 <h1 className="text-2xl font-bold text-coral-crimson">Store Settings</h1>
 <StoreSettingsForm initialData={initialData} onSubmit={handleSubmit} />
 </div>
 );
}

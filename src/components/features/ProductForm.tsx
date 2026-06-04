'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '@/lib/validations/product';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';
import type { Category } from '@/types/models';

interface ProductFormProps {
 categories: Category[];
 initialData?: Partial<ProductFormData>;
 onSubmit: (data: ProductFormData) => Promise<void>;
 loading?: boolean;
}

export function ProductForm({ categories, initialData, onSubmit, loading }: ProductFormProps) {
 const {
 register,
 handleSubmit,
 setValue,
 watch,
 formState: { errors, isSubmitting },
 } = useForm<ProductFormData>({
 resolver: zodResolver(productSchema) as any,
 defaultValues: {
 name: '',
 description: '',
 price: undefined,
 compare_at_price: undefined,
 category_id: '',
 is_available: true,
 preparation_time_minutes: undefined,
 images: [],
 ...initialData,
 },
 });

 const images = watch('images') ?? [];
 const isAvailable = watch('is_available');

 return (
 <form onSubmit={handleSubmit(onSubmit as SubmitHandler<ProductFormData>)} className="space-y-6">
 <Input
 label="Product Name"
 placeholder="e.g. Chocolate Cake"
 error={errors.name?.message}
 {...register('name')}
 />

 <Select
 label="Category"
 options={categories.map((c) => ({ value: c.id, label: c.name }))}
 placeholder="Select a category"
 error={errors.category_id?.message}
 {...register('category_id')}
 />

 <div className="space-y-1.5">
 <label htmlFor="description" className="block text-sm font-medium text-coral-crimson">
 Description
 </label>
 <textarea
 id="description"
 rows={4}
 className="block w-full rounded-[90px] border border-coral-crimson/20 bg-pure-white px-4 py-2.5 text-sm text-coral-crimson placeholder:text-coral-crimson/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
 placeholder="Describe your product..."
 {...register('description')}
 />
 {errors.description && (
 <p className="text-sm text-red-600">{errors.description.message}</p>
 )}
 </div>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <Input
 label="Price (ETB)"
 type="number"
 step="0.01"
 placeholder="0.00"
 error={errors.price?.message}
 {...register('price')}
 />
 <Input
 label="Compare at Price (ETB)"
 type="number"
 step="0.01"
 placeholder="0.00"
 helperText="Shows original price with discount"
 error={errors.compare_at_price?.message}
 {...register('compare_at_price')}
 />
 </div>

 <Input
 label="Preparation Time (minutes)"
 type="number"
 placeholder="e.g. 30"
 error={errors.preparation_time_minutes?.message}
 {...register('preparation_time_minutes')}
 />

 <FileUpload
 label="Product Images (max 5)"
 maxFiles={5}
 value={images}
 onChange={(files) => setValue('images', files, { shouldValidate: true })}
 error={errors.images?.message}
 />

 <label className="flex items-center gap-3">
 <input
 type="checkbox"
 checked={isAvailable}
 className="h-5 w-5 rounded-md border-coral-crimson/30 text-brand-600 focus:ring-brand-500"
 onChange={(e) => setValue('is_available', e.target.checked)}
 />
 <span className="text-sm font-medium text-coral-crimson">Available for ordering</span>
 </label>

 <div className="flex items-center gap-3 pt-4">
 <Button type="submit" loading={isSubmitting || loading}>
 {initialData ? 'Update Product' : 'Add Product'}
 </Button>
 </div>
 </form>
 );
}

'use client';

import { useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { storeSettingsSchema, type StoreSettingsFormData } from '@/lib/validations/seller';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';

const DAYS = [
'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
] as const;

const DAY_LABELS: Record<string, string> = {
 monday: 'Monday',
 tuesday: 'Tuesday',
 wednesday: 'Wednesday',
 thursday: 'Thursday',
 friday: 'Friday',
 saturday: 'Saturday',
 sunday: 'Sunday',
};

interface StoreSettingsFormProps {
 initialData?: Partial<StoreSettingsFormData>;
 onSubmit: (data: StoreSettingsFormData) => Promise<void>;
 loading?: boolean;
}

export function StoreSettingsForm({ initialData, onSubmit, loading }: StoreSettingsFormProps) {
 const {
 register,
 handleSubmit,
 control,
 setValue,
 watch,
 formState: { errors, isSubmitting },
 } = useForm<StoreSettingsFormData>({
 resolver: zodResolver(storeSettingsSchema) as any,
 defaultValues: {
 name: '',
 description: '',
 phone: '',
 location: '',
 preparation_time_minutes: undefined,
 pickup_available: true,
 delivery_available: false,
 working_hours: DAYS.map((day) => ({ day, open: '09:00', close: '18:00', is_closed: false })),
 ...initialData,
 },
 });

 const { fields } = useFieldArray({ control, name: 'working_hours' });
 const logo = watch('logo');
 const banner = watch('banner');

 return (
 <form onSubmit={handleSubmit(onSubmit as SubmitHandler<StoreSettingsFormData>)} className="space-y-8">
 <section>
 <h3 className="text-lg font-semibold text-coral-crimson mb-4">Store Info</h3>
 <div className="space-y-4">
 <Input
 label="Store Name"
 error={errors.name?.message}
 {...register('name')}
 />
 <div className="space-y-1.5">
 <label htmlFor="description" className="block text-sm font-medium text-coral-crimson">
 Description
 </label>
 <textarea
 id="description"
 rows={3}
 className="block w-full rounded-[90px] border border-coral-crimson/20 bg-pure-white px-4 py-2.5 text-sm text-coral-crimson placeholder:text-coral-crimson/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
 {...register('description')}
 />
 </div>
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <Input label="Phone" type="tel" {...register('phone')} />
 <Input label="Location" {...register('location')} />
 </div>
 </div>
 </section>

 <section>
 <h3 className="text-lg font-semibold text-coral-crimson mb-4">Working Hours</h3>
 <div className="space-y-3">
 {fields.map((field, idx) => (
 <div key={field.id} className="flex flex-wrap items-center gap-3 rounded-[90px] border border-coral-crimson/10 bg-pure-white p-3">
 <span className="w-24 text-sm font-medium text-coral-crimson">
 {DAY_LABELS[field.day]}
 </span>
 <input type="hidden" {...register(`working_hours.${idx}.day`)} />
 <label className="flex items-center gap-2 text-sm text-coral-crimson/70">
 <input
 type="checkbox"
 className="h-4 w-4 rounded border-coral-crimson/30 text-brand-600 focus:ring-brand-500"
 {...register(`working_hours.${idx}.is_closed`)}
 />
 Closed
 </label>
 <Input
 type="time"
 className="w-32"
 {...register(`working_hours.${idx}.open`)}
 />
 <span className="text-sm text-coral-crimson/50">to</span>
 <Input
 type="time"
 className="w-32"
 {...register(`working_hours.${idx}.close`)}
 />
 </div>
 ))}
 </div>
 </section>

 <section>
 <h3 className="text-lg font-semibold text-coral-crimson mb-4">Preparation & Fulfillment</h3>
 <div className="space-y-4">
 <Input
 label="Default Preparation Time (minutes)"
 type="number"
 {...register('preparation_time_minutes')}
 />
 <div className="flex gap-6">
 <label className="flex items-center gap-2 text-sm font-medium text-coral-crimson">
 <input
 type="checkbox"
 className="h-5 w-5 rounded-md border-coral-crimson/30 text-brand-600 focus:ring-brand-500"
 {...register('pickup_available')}
 />
 Pickup Available
 </label>
 <label className="flex items-center gap-2 text-sm font-medium text-coral-crimson">
 <input
 type="checkbox"
 className="h-5 w-5 rounded-md border-coral-crimson/30 text-brand-600 focus:ring-brand-500"
 {...register('delivery_available')}
 />
 Delivery Available
 </label>
 </div>
 </div>
 </section>

 <section>
 <h3 className="text-lg font-semibold text-coral-crimson mb-4">Images</h3>
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <FileUpload
 label="Profile / Logo"
 maxFiles={1}
 value={logo ? [logo] : []}
 onChange={(files) => setValue('logo', files[0], { shouldValidate: true })}
 />
 <FileUpload
 label="Banner Image"
 maxFiles={1}
 value={banner ? [banner] : []}
 onChange={(files) => setValue('banner', files[0], { shouldValidate: true })}
 />
 </div>
 </section>

 <div className="pt-4">
 <Button type="submit" loading={isSubmitting || loading}>
 Save Settings
 </Button>
 </div>
 </form>
 );
}

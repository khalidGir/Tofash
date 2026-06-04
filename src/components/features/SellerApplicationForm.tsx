'use client';

import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sellerApplicationSchema, type SellerApplicationFormData } from '@/lib/validations/seller';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';

interface SellerApplicationFormProps {
 onSubmit: (data: SellerApplicationFormData) => Promise<void>;
 loading?: boolean;
}

export function SellerApplicationForm({ onSubmit, loading }: SellerApplicationFormProps) {
 const {
 register,
 handleSubmit,
 control,
 setValue,
 watch,
 formState: { errors, isSubmitting },
 } = useForm<SellerApplicationFormData>({
 resolver: zodResolver(sellerApplicationSchema) as any,
 defaultValues: {
 full_name: '',
 phone: '',
 store_name: '',
 social_links: [{ platform: '', url: '' }],
 payment_bank_name: '',
 payment_account_number: '',
 payment_account_holder: '',
 location: '',
 accept_terms: false as unknown as true,
 },
 });

 const { fields, append, remove } = useFieldArray({ control, name: 'social_links' });
 const idDocument = watch('id_document');
 const profileImage = watch('profile_image');

 return (
 <form onSubmit={handleSubmit(onSubmit as SubmitHandler<SellerApplicationFormData>)} className="space-y-6">
 <h2 className="text-xl font-semibold text-coral-crimson">Apply to Become a Seller</h2>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <Input label="Full Name" error={errors.full_name?.message} {...register('full_name')} />
 <Input label="Phone Number" type="tel" error={errors.phone?.message} {...register('phone')} />
 </div>

 <Input label="Store Name" error={errors.store_name?.message} {...register('store_name')} />

 <FileUpload
 label="Government ID (Required)"
 maxFiles={1}
 value={idDocument ? [idDocument] : []}
 onChange={(files) => setValue('id_document', files[0], { shouldValidate: true })}
 error={errors.id_document?.message}
 />

 <FileUpload
 label="Profile Image (Optional)"
 maxFiles={1}
 value={profileImage ? [profileImage] : []}
 onChange={(files) => setValue('profile_image', files[0])}
 />

 <section>
 <h3 className="text-sm font-medium text-coral-crimson mb-2">Social Media Links</h3>
 <div className="space-y-3">
 {fields.map((field, idx) => (
 <div key={field.id} className="flex items-start gap-2">
 <div className="flex-1 grid grid-cols-2 gap-2">
 <Input placeholder="Platform (e.g. Instagram)" {...register(`social_links.${idx}.platform`)} />
 <Input placeholder="URL" {...register(`social_links.${idx}.url`)} />
 </div>
 {fields.length > 1 && (
 <button
 type="button"
 onClick={() => remove(idx)}
 className="mt-2 text-sm text-red-600 hover:text-red-700"
 >
 Remove
 </button>
 )}
 </div>
 ))}
 <button
 type="button"
 onClick={() => append({ platform: '', url: '' })}
 className="text-sm font-medium text-brand-600 hover:text-brand-700"
 >
 + Add social link
 </button>
 </div>
 </section>

 <section>
 <h3 className="text-sm font-medium text-coral-crimson mb-2">Payment Details</h3>
 <div className="space-y-4">
 <Input label="Bank Name" error={errors.payment_bank_name?.message} {...register('payment_bank_name')} />
 <Input label="Account Number" error={errors.payment_account_number?.message} {...register('payment_account_number')} />
 <Input label="Account Holder Name" error={errors.payment_account_holder?.message} {...register('payment_account_holder')} />
 </div>
 </section>

 <Input label="Location" placeholder="e.g. Bole, Addis Ababa" error={errors.location?.message} {...register('location')} />

 <label className="flex items-start gap-3">
 <input
 type="checkbox"
 className="mt-1 h-5 w-5 rounded-md border-coral-crimson/30 text-brand-600 focus:ring-brand-500"
 {...register('accept_terms')}
 />
 <span className="text-sm text-coral-crimson/70">
 I confirm that the information provided is accurate and I agree to the{''}
 <a href="#" className="text-brand-600 underline">Terms of Service</a>
 </span>
 </label>
 {errors.accept_terms && (
 <p className="text-sm text-red-600">{errors.accept_terms.message}</p>
 )}

 <Button type="submit" loading={isSubmitting || loading} className="w-full sm:w-auto">
 Submit Application
 </Button>
 </form>
 );
}

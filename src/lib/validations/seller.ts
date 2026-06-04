import { z } from 'zod';

export const sellerApplicationSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  store_name: z.string().min(2, 'Store name is required'),
  id_document: z.instanceof(File, { message: 'Government ID is required' }),
  profile_image: z.instanceof(File).optional(),
  social_links: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url('Invalid URL'),
    })
  ).optional(),
  payment_bank_name: z.string().min(1, 'Bank name is required'),
  payment_account_number: z.string().min(1, 'Account number is required'),
  payment_account_holder: z.string().min(1, 'Account holder name is required'),
  location: z.string().min(1, 'Location is required'),
  accept_terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms',
  }),
});

export type SellerApplicationFormData = z.infer<typeof sellerApplicationSchema>;

export const storeSettingsSchema = z.object({
  name: z.string().min(2, 'Store name is required'),
  description: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  preparation_time_minutes: z.coerce.number().int().min(0).optional(),
  pickup_available: z.boolean().default(true),
  delivery_available: z.boolean().default(false),
  working_hours: z.array(
    z.object({
      day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
      open: z.string().optional(),
      close: z.string().optional(),
      is_closed: z.boolean().default(false),
    })
  ).length(7),
  logo: z.instanceof(File).optional(),
  banner: z.instanceof(File).optional(),
});

export type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>;

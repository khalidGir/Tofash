import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be positive'),
  compare_at_price: z.coerce.number().positive().optional(),
  category_id: z.string().uuid(),
  is_available: z.boolean().default(true),
  preparation_time_minutes: z.coerce.number().int().positive().optional(),
  images: z.array(z.instanceof(File)).max(5, 'Max 5 images'),
});

export type ProductFormData = z.infer<typeof productSchema>;

-- ============================================================
-- TOFASH — STORAGE BUCKETS & POLICIES
-- Run in Supabase SQL Editor
-- ============================================================

-- BUCKET: product-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,                                    -- public read
  5242880,                                 -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- BUCKET: seller-profiles
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'seller-profiles',
  'seller-profiles',
  true,
  3145728,                                 -- 3 MB
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- BUCKET: payment-proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,                                   -- private; access via RLS
  10485760,                                -- 10 MB
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- BUCKET: banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================

-- PRODUCT IMAGES: anyone can read; sellers upload to their store; admins upload
CREATE POLICY "product_images_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.seller_id = auth.uid()
        AND storage.foldername(name)[1] = s.id::text
    ) OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  );

CREATE POLICY "product_images_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images'
    AND (EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.seller_id = auth.uid()
        AND storage.foldername(name)[1] = s.id::text
    ) OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  );

CREATE POLICY "product_images_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images'
    AND (EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.seller_id = auth.uid()
        AND storage.foldername(name)[1] = s.id::text
    ) OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  );

-- SELLER PROFILES: public read; seller uploads own
CREATE POLICY "seller_profiles_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'seller-profiles');

CREATE POLICY "seller_profiles_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'seller-profiles'
    AND storage.foldername(name)[1] = auth.uid()::text
  );

-- PAYMENT PROOFS: order participants only
CREATE POLICY "payment_proofs_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-proofs'
    AND (EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id::text = storage.foldername(name)[2]
        AND (o.customer_id = auth.uid()
          OR o.store_id IN (SELECT id FROM public.stores WHERE seller_id = auth.uid()))
    ) OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  );

CREATE POLICY "payment_proofs_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id::text = storage.foldername(name)[2]
        AND o.customer_id = auth.uid()
    )
  );

-- BANNERS: public read; admin only upload
CREATE POLICY "banners_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "banners_insert_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'banners'
    AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- FOLDER STRUCTURE (convention, not enforced by SQL)
-- ============================================================
-- product-images/{store_id}/{product_id}/{uuid}.jpg
-- seller-profiles/{user_id}/{uuid}.jpg
-- payment-proofs/{order_id}/{uuid}.jpg
-- banners/{uuid}.jpg

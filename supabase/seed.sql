-- ============================================================
-- TOFASH — DEVELOPMENT SEED DATA
-- Run separately (NOT as part of migration chain):
--   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
-- ============================================================

-- ============================================================
-- 1. DESSERT CATEGORIES (extends 00002_seed.sql)
-- ============================================================
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Cakes',              'cakes',              'Birthday cakes, layer cakes, cheesecakes, sponge cakes, and celebration cakes — whole and by the slice',    1),
  ('Cookies',            'cookies',            'Crunchy, chewy, chocolate chip, oatmeal, macarons, and traditional Ethiopian cookies',                        2),
  ('Cupcakes',           'cupcakes',           'Mini delights for every occasion — classic, filled, and designer cupcakes',                                     3),
  ('Pastries',           'pastries',           'Croissants, danishes, puff pastry treats, scones, and Ethiopian-inspired pastry snacks',                         4),
  ('Ethiopian Sweets',   'ethiopian-sweets',   'Traditional Ethiopian desserts — halva, kollo, dabo kolo, asa, and sweet firfir-inspired treats',                5),
  ('Brownies & Bars',    'brownies-bars',      'Fudgy brownies, blondies, lemon bars, date bars, and layered dessert bars',                                      6),
  ('Puddings & Custards','puddings-custards',  'Creamy vanilla pudding, chocolate mousse, crème brûlée, rice pudding, and traditional Ethiopian custards',       7),
  ('Dessert Platters',   'dessert-platters',   'Assorted dessert boxes, party platters, gift baskets, and custom dessert catering trays',                         8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. ADMIN USER SETUP
-- ============================================================
-- Step 1: Create the admin user via Supabase Auth Dashboard or Auth API.
-- Step 2: Replace '<AUTH_USER_ID>' below with the actual auth.uid() and run:
--
--   INSERT INTO public.profiles (id, phone, full_name, role)
--   VALUES ('<AUTH_USER_ID>', '+251911111111', 'Tofash Admin', 'admin');
--
-- Step 3: Verify:
--   SELECT id, phone, full_name, role FROM public.profiles WHERE role = 'admin';

-- ============================================================
-- 3. SAMPLE STORE & PRODUCTS (Development Sandbox)
-- ============================================================
-- Uncomment and run locally for development/testing.
-- Replace '<SELLER_AUTH_ID>' with a real auth user UUID you created.
--
-- BEGIN;
--
-- -- Create seller profile
-- INSERT INTO public.profiles (id, phone, full_name, role)
-- VALUES ('<SELLER_AUTH_ID>', '+251912345678', 'Meron Bekele', 'seller');
--
-- -- Create store
-- WITH store AS (
--   INSERT INTO public.stores (seller_id, name, slug, description, phone, location, is_active)
--   VALUES (
--     '<SELLER_AUTH_ID>',
--     'Meron''s Bakery',
--     'merons-bakery-' || substr(md5(random()::text), 1, 6),
--     'Homemade cakes, cookies, and traditional Ethiopian sweets. Made fresh daily in Bole, Addis Ababa.',
--     '+251912345678',
--     'Bole, Addis Ababa, near Bole International Airport',
--     true
--   )
--   RETURNING id
-- )
-- -- Add products
-- INSERT INTO public.products (store_id, category_id, name, slug, description, price, is_available)
-- SELECT
--   store.id,
--   c.id,
--   unnest(ARRAY['Chocolate Layer Cake', 'Ethiopian Honey Bread', 'Assorted Cookie Box']),
--   unnest(ARRAY['chocolate-layer-cake', 'ethiopian-honey-bread', 'assorted-cookie-box']),
--   unnest(ARRAY['Rich chocolate ganache layer cake with vanilla buttercream', 'Traditional honey-sweetened bread with cardamom and cloves', '12 mixed cookies — chocolate chip, oatmeal, and macarons']),
--   unnest(ARRAY[35.00, 20.00, 25.00]::numeric[]),
--   unnest(ARRAY[true, true, true])
-- FROM store
-- CROSS JOIN public.categories c
-- WHERE c.slug = 'cakes' AND store.id IS NOT NULL;
--
-- COMMIT;

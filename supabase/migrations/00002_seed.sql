-- ============================================================
-- TOFASH — SEED DATA
-- ============================================================

-- CATEGORIES
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Cakes',       'cakes',       'Birthday cakes, layer cakes, cheesecakes & more', 1),
  ('Cookies',     'cookies',     'Crunchy, chewy, chocolate chip & traditional',     2),
  ('Cupcakes',    'cupcakes',    'Mini delights for every occasion',                 3),
  ('Pastries',    'pastries',    'Croissants, danishes, puff pastry treats',         4),
  ('Ethiopian Sweets', 'ethiopian-sweets', 'Traditional Ethiopian desserts & sweets', 5),
  ('Brownies & Bars', 'brownies-bars', 'Fudgy brownies, blondies & dessert bars',    6),
  ('Puddings & Custards', 'puddings-custards', 'Creamy desserts & traditional custards', 7),
  ('Dessert Platters', 'dessert-platters', 'Assorted dessert boxes & platters',       8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- ADMIN USER SETUP
-- Run after creating admin user in Supabase Auth
-- Replace the UUID below with the actual admin user ID
-- ============================================================
-- INSERT INTO public.profiles (id, phone, full_name, role)
-- VALUES ('<AUTH_USER_ID>', '+251911111111', 'Tofash Admin', 'admin');

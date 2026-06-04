-- ============================================================
-- TOFASH — SUPABASE BACKEND ARCHITECTURE (Phase 1 MVP)
-- ============================================================
-- All commands idempotent: CREATE OR REPLACE / IF NOT EXISTS
-- ============================================================

-- 0. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending_payment',
    'pending_verification',
    'accepted',
    'rejected',
    'completed',
    'cancelled',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fulfillment_type AS ENUM ('pickup', 'delivery');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE schedule_type AS ENUM ('immediate', 'scheduled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE seller_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE dispute_status AS ENUM ('open', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. TABLES
-- ============================================================

-- 2.1 PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone           TEXT NOT NULL UNIQUE,
  full_name       TEXT NOT NULL,
  avatar_url      TEXT,
  role            user_role NOT NULL DEFAULT 'customer',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 SELLER APPLICATIONS (pre-approval)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.seller_applications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  phone             TEXT NOT NULL,
  government_id_url TEXT NOT NULL,
  store_name        TEXT NOT NULL,
  profile_image_url TEXT,
  social_links      JSONB DEFAULT '[]'::jsonb,
  payment_details   JSONB NOT NULL, -- { bank_name, account_number, account_holder }
  location          TEXT NOT NULL, -- free text description
  status            seller_status NOT NULL DEFAULT 'pending',
  reviewed_by       UUID REFERENCES public.profiles(id),
  review_notes      TEXT,
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at       TIMESTAMPTZ,
  CONSTRAINT unique_pending_application UNIQUE (user_id, status)
);

-- 2.3 STORES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stores (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  banner_url        TEXT,
  logo_url          TEXT,
  phone             TEXT,
  location          TEXT,
  pickup_available  BOOLEAN NOT NULL DEFAULT true,
  delivery_available BOOLEAN NOT NULL DEFAULT false,
  preparation_time_minutes INT NOT NULL DEFAULT 30,
  is_active         BOOLEAN NOT NULL DEFAULT false, -- activated after approval
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  total_ratings     INT NOT NULL DEFAULT 0,
  avg_rating        NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  total_orders      INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 WORKING HOURS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.working_hours (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  open_time   TIME NOT NULL,
  close_time  TIME NOT NULL,
  is_closed   BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT unique_store_day UNIQUE (store_id, day_of_week)
);

-- 2.5 SELLER HOLIDAYS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.seller_holidays (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  reason      TEXT,
  CONSTRAINT unique_store_date UNIQUE (store_id, date)
);

-- 2.6 CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.7 PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id          UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id       UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL,
  description       TEXT,
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price  NUMERIC(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  preparation_time_minutes INT,
  is_available      BOOLEAN NOT NULL DEFAULT true,
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  is_active         BOOLEAN NOT NULL DEFAULT true, -- admin toggle for moderation
  search_vector     TSVECTOR,
  total_ratings     INT NOT NULL DEFAULT 0,
  avg_rating        NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_store_product_slug UNIQUE (store_id, slug)
);

-- 2.8 PRODUCT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.9 CARTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.carts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_store_cart UNIQUE (user_id, store_id)
);

-- 2.10 CART ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id     UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity    INT NOT NULL CHECK (quantity > 0),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id)
);

-- 2.11 ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number      TEXT NOT NULL UNIQUE, -- human-readable: TOF-XXXXXX
  customer_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_id          UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  status            order_status NOT NULL DEFAULT 'pending_payment',
  fulfillment_type  fulfillment_type NOT NULL DEFAULT 'pickup',
  schedule_type     schedule_type NOT NULL DEFAULT 'immediate',
  scheduled_date    TIMESTAMPTZ, -- NULL if immediate
  customer_notes    TEXT,
  subtotal          NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  paid_amount       NUMERIC(10,2), -- confirmed by seller
  payment_verified_at TIMESTAMPTZ,
  accepted_at       TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  cancelled_reason  TEXT,
  expires_at        TIMESTAMPTZ, -- auto-expire timeout
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.12 ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL, -- snapshot at time of order
  product_image TEXT,         -- snapshot
  quantity      INT NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal      NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.13 PAYMENT PROOFS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  notes         TEXT,
  verified_by   UUID REFERENCES public.profiles(id), -- seller who verified
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejected_reason TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at   TIMESTAMPTZ
);

-- 2.14 CHATS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chats (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_order_chat UNIQUE (order_id)
);

-- 2.15 MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id     UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.16 REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_customer_product_review UNIQUE (customer_id, product_id, order_id)
);

-- 2.17 FAVORITES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_product_favorite UNIQUE (user_id, product_id)
);

-- 2.18 FEATURED SELLERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.featured_sellers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  start_date  TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date    TIMESTAMPTZ NOT NULL,
  created_by  UUID NOT NULL REFERENCES public.profiles(id),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.19 DISPUTE REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dispute_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reported_by     UUID NOT NULL REFERENCES public.profiles(id),
  reason          TEXT NOT NULL,
  description     TEXT,
  status          dispute_status NOT NULL DEFAULT 'open',
  resolved_by     UUID REFERENCES public.profiles(id),
  resolution_note TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ
);

-- 2.20 ADMIN AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID NOT NULL REFERENCES public.profiles(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'seller', 'product', 'order', 'dispute'
  entity_id   UUID NOT NULL,
  old_data    JSONB,
  new_data    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

-- PROFILES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- SELLER APPLICATIONS
CREATE INDEX IF NOT EXISTS idx_seller_applications_status ON public.seller_applications(status);
CREATE INDEX IF NOT EXISTS idx_seller_applications_user ON public.seller_applications(user_id);

-- STORES
CREATE INDEX IF NOT EXISTS idx_stores_seller ON public.stores(seller_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_featured ON public.stores(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_stores_active ON public.stores(is_active) WHERE is_active = true;

-- WORKING HOURS
CREATE INDEX IF NOT EXISTS idx_working_hours_store ON public.working_hours(store_id);

-- SELLER HOLIDAYS
CREATE INDEX IF NOT EXISTS idx_seller_holidays_store_date ON public.seller_holidays(store_id, date);

-- PRODUCTS
CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_store_active ON public.products(store_id) WHERE is_active = true;

-- ORDERS
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_store_status ON public.orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_expires ON public.orders(expires_at) WHERE expires_at IS NOT NULL;

-- ORDER ITEMS
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- PAYMENT PROOFS
CREATE INDEX IF NOT EXISTS idx_payment_proofs_order ON public.payment_proofs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON public.payment_proofs(status);

-- CHATS & MESSAGES
CREATE INDEX IF NOT EXISTS idx_chats_order ON public.chats(order_id);
CREATE INDEX IF NOT EXISTS idx_chats_participants ON public.chats(customer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(chat_id, is_read) WHERE is_read = false;

-- REVIEWS
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON public.reviews(customer_id);

-- FAVORITES
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product ON public.favorites(product_id);

-- DISPUTES
CREATE INDEX IF NOT EXISTS idx_disputes_order ON public.dispute_reports(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.dispute_reports(status);

-- AUDIT LOGS
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.admin_audit_logs(entity_type, entity_id);

-- ============================================================
-- 4. FULL-TEXT SEARCH
-- ============================================================
CREATE OR REPLACE FUNCTION public.products_search_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_search ON public.products;
CREATE TRIGGER trg_products_search
  BEFORE INSERT OR UPDATE OF name, description ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.products_search_update();

-- ============================================================
-- 5. AUTOMATIC TIMESTAMPS
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$ DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['profiles','stores','products','carts','orders'])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON public.%I;', tbl, tbl
    );
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================
-- 6. ORDER NUMBER GENERATION
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text AS $$
DECLARE
  seq_num INT;
  date_part TEXT;
BEGIN
  date_part := to_char(now(), 'YYMMDD');
  seq_num := nextval('order_number_seq'::regclass) % 1000000;
  RETURN 'TOF-' || date_part || LPAD(seq_num::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

-- ============================================================
-- 7. AUTO-EXPIRE UNPAID ORDERS (called by pg_cron or Edge Function)
-- ============================================================
CREATE OR REPLACE FUNCTION public.expire_stale_orders()
RETURNS int AS $$
DECLARE
  expired_count INT;
BEGIN
  UPDATE public.orders
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending_verification'
    AND expires_at IS NOT NULL
    AND expires_at < now()
    AND expires_at > '2020-01-01'; -- sanity check
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. UPDATE STORE RATINGS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_store_ratings(p_store_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.stores
  SET
    avg_rating = COALESCE(
      (SELECT ROUND(AVG(r.rating)::numeric, 2)
       FROM public.reviews r
       JOIN public.products p ON p.id = r.product_id
       WHERE p.store_id = p_store_id),
      0.00
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM public.reviews r
      JOIN public.products p ON p.id = r.product_id
      WHERE p.store_id = p_store_id
    )
  WHERE id = p_store_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. UPDATE PRODUCT RATINGS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_product_ratings(p_product_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.products
  SET
    avg_rating = COALESCE(
      (SELECT ROUND(AVG(rating)::numeric, 2)
       FROM public.reviews WHERE product_id = p_product_id),
      0.00
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM public.reviews WHERE product_id = p_product_id
    )
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 10. TRIGGER: Update ratings when a review is added
-- ============================================================
CREATE OR REPLACE FUNCTION public.on_review_insert()
RETURNS trigger AS $$
BEGIN
  PERFORM public.update_product_ratings(NEW.product_id);
  PERFORM public.update_store_ratings(
    (SELECT store_id FROM public.products WHERE id = NEW.product_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_review_insert ON public.reviews;
CREATE TRIGGER trg_review_insert
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.on_review_insert();

-- ============================================================
-- 11. TRIGGER: Auto-set order number on insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.on_order_insert()
RETURNS trigger AS $$
BEGIN
  NEW.order_number := public.generate_order_number();
  -- Set auto-expiry to 24 hours if pending_verification
  IF NEW.status = 'pending_payment' THEN
    NEW.expires_at := now() + INTERVAL '24 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_insert ON public.orders;
CREATE TRIGGER trg_order_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.on_order_insert();

-- ============================================================
-- 12. TRIGGER: Update store total_orders on order completion
-- ============================================================
CREATE OR REPLACE FUNCTION public.on_order_completed()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    UPDATE public.stores
    SET total_orders = total_orders + 1
    WHERE id = NEW.store_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_completed ON public.orders;
CREATE TRIGGER trg_order_completed
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.on_order_completed();

-- ============================================================
-- 13. ANALYTICS AGGREGATION FUNCTIONS
-- ============================================================

-- 13.1 GMV (Gross Merchandise Value) in date range
CREATE OR REPLACE FUNCTION public.get_gmv(
  p_start_date TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days',
  p_end_date   TIMESTAMPTZ DEFAULT now()
)
RETURNS NUMERIC(12,2) AS $$
  SELECT COALESCE(SUM(paid_amount), 0)
  FROM public.orders
  WHERE status = 'completed'
    AND completed_at BETWEEN p_start_date AND p_end_date;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 13.2 Top sellers by order count
CREATE OR REPLACE FUNCTION public.get_top_sellers(
  p_limit INT DEFAULT 10,
  p_start_date TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days',
  p_end_date   TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE(
  store_id    UUID,
  store_name  TEXT,
  order_count BIGINT,
  revenue     NUMERIC
) AS $$
  SELECT
    s.id,
    s.name,
    COUNT(o.id)::BIGINT AS order_count,
    COALESCE(SUM(o.paid_amount), 0) AS revenue
  FROM public.orders o
  JOIN public.stores s ON s.id = o.store_id
  WHERE o.status = 'completed'
    AND o.completed_at BETWEEN p_start_date AND p_end_date
  GROUP BY s.id, s.name
  ORDER BY order_count DESC
  LIMIT p_limit;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 13.3 Repeat customer rate
CREATE OR REPLACE FUNCTION public.get_repeat_customer_rate(
  p_start_date TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days',
  p_end_date   TIMESTAMPTZ DEFAULT now()
)
RETURNS NUMERIC(5,2) AS $$
  WITH customer_orders AS (
    SELECT customer_id, COUNT(*) AS order_count
    FROM public.orders
    WHERE status = 'completed'
      AND completed_at BETWEEN p_start_date AND p_end_date
    GROUP BY customer_id
  )
  SELECT
    CASE WHEN COUNT(*) = 0 THEN 0
    ELSE ROUND(
      SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END)::NUMERIC
      / COUNT(*) * 100, 2
    ) END
  FROM customer_orders;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 14. ROW LEVEL SECURITY — ENABLE & POLICIES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14.1 PROFILES POLICIES
-- ============================================================
-- Admin sees all; users see own; sellers see customers who ordered from them
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "profiles_select_seller_customer"
  ON public.profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE (o.customer_id = public.profiles.id OR o.store_id IN (
      SELECT store_id FROM public.stores WHERE seller_id = auth.uid()
    ))
    AND (o.customer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.stores WHERE seller_id = auth.uid()
    ))
  ));

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  )); -- can't change own role

-- ============================================================
-- 14.2 SELLER APPLICATIONS POLICIES
-- ============================================================
CREATE POLICY "seller_applications_insert_own"
  ON public.seller_applications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "seller_applications_select_own"
  ON public.seller_applications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "seller_applications_select_admin"
  ON public.seller_applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "seller_applications_update_admin"
  ON public.seller_applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================
-- 14.3 STORES POLICIES
-- ============================================================
CREATE POLICY "stores_select_all"
  ON public.stores FOR SELECT
  USING (is_active = true OR seller_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "stores_update_seller"
  ON public.stores FOR UPDATE
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "stores_update_admin"
  ON public.stores FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================
-- 14.4 WORKING HOURS & HOLIDAYS POLICIES
-- ============================================================
CREATE POLICY "working_hours_select_all"
  ON public.working_hours FOR SELECT
  USING (true);

CREATE POLICY "working_hours_manage"
  ON public.working_hours FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.stores WHERE id = store_id AND seller_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "seller_holidays_select_all"
  ON public.seller_holidays FOR SELECT
  USING (true);

CREATE POLICY "seller_holidays_manage"
  ON public.seller_holidays FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.stores WHERE id = store_id AND seller_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================
-- 14.5 CATEGORIES POLICIES
-- ============================================================
CREATE POLICY "categories_select_all"
  ON public.categories FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "categories_manage_admin"
  ON public.categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================
-- 14.6 PRODUCTS POLICIES
-- ============================================================
CREATE POLICY "products_select_all"
  ON public.products FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.stores WHERE id = store_id AND seller_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "products_insert_seller"
  ON public.products FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores WHERE id = store_id AND seller_id = auth.uid()
  ));

CREATE POLICY "products_update_seller"
  ON public.products FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.stores WHERE id = store_id AND seller_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores WHERE id = store_id AND seller_id = auth.uid()
  ));

CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "products_delete_seller"
  ON public.products FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.stores WHERE id = store_id AND seller_id = auth.uid()
  ));

-- ============================================================
-- 14.7 PRODUCT IMAGES POLICIES
-- ============================================================
CREATE POLICY "product_images_select_all"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "product_images_manage_seller"
  ON public.product_images FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.stores s ON s.id = p.store_id
    WHERE p.id = product_id AND s.seller_id = auth.uid()
  ));

-- ============================================================
-- 14.8 CARTS & CART ITEMS POLICIES
-- ============================================================
CREATE POLICY "carts_manage_own"
  ON public.carts FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "cart_items_manage_own"
  ON public.cart_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid()
  ));

-- ============================================================
-- 14.9 ORDERS POLICIES
-- ============================================================
CREATE POLICY "orders_select_customer"
  ON public.orders FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "orders_select_seller"
  ON public.orders FOR SELECT
  USING (store_id IN (
    SELECT id FROM public.stores WHERE seller_id = auth.uid()
  ));

CREATE POLICY "orders_select_admin"
  ON public.orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "orders_insert_customer"
  ON public.orders FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "orders_update_customer"
  ON public.orders FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid() AND NEW.status IN ('cancelled'));

CREATE POLICY "orders_update_seller"
  ON public.orders FOR UPDATE
  USING (store_id IN (
    SELECT id FROM public.stores WHERE seller_id = auth.uid()
  ))
  WITH CHECK (store_id IN (
    SELECT id FROM public.stores WHERE seller_id = auth.uid()
  ) AND NEW.status IN ('accepted','rejected','completed','pending_payment'));

CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================
-- 14.10 ORDER ITEMS POLICIES
-- ============================================================
CREATE POLICY "order_items_select_participant"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id
      AND (o.customer_id = auth.uid()
        OR o.store_id IN (SELECT id FROM public.stores WHERE seller_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  ));

CREATE POLICY "order_items_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid()
  ));

-- ============================================================
-- 14.11 PAYMENT PROOFS POLICIES
-- ============================================================
CREATE POLICY "payment_proofs_insert_customer"
  ON public.payment_proofs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid()
  ));

CREATE POLICY "payment_proofs_select_participant"
  ON public.payment_proofs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id
      AND (o.customer_id = auth.uid()
        OR o.store_id IN (SELECT id FROM public.stores WHERE seller_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  ));

CREATE POLICY "payment_proofs_update_seller"
  ON public.payment_proofs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.stores s ON s.id = o.store_id
    WHERE o.id = order_id AND s.seller_id = auth.uid()
  ));

-- ============================================================
-- 14.12 CHATS & MESSAGES POLICIES
-- ============================================================
CREATE POLICY "chats_select_participant"
  ON public.chats FOR SELECT
  USING (customer_id = auth.uid() OR seller_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "chats_insert"
  ON public.chats FOR INSERT
  WITH CHECK (customer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = chat_id
      AND (customer_id = auth.uid() OR seller_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
      ))
  ));

CREATE POLICY "messages_insert_participant"
  ON public.messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = chat_id
      AND (customer_id = auth.uid() OR seller_id = auth.uid())
  ) AND sender_id = auth.uid());

CREATE POLICY "messages_update_read"
  ON public.messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = chat_id
      AND (customer_id = auth.uid() OR seller_id = auth.uid())
  ))
  WITH CHECK (is_read = true); -- can only mark as read

-- ============================================================
-- 14.13 REVIEWS POLICIES
-- ============================================================
CREATE POLICY "reviews_select_all"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_verified"
  ON public.reviews FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.order_items oi ON oi.order_id = o.id
      WHERE o.id = order_id
        AND o.customer_id = auth.uid()
        AND o.status = 'completed'
        AND oi.product_id = product_id
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.reviews
      WHERE customer_id = auth.uid() AND product_id = product_id AND order_id = order_id
    )
  );

-- ============================================================
-- 14.14 FAVORITES POLICIES
-- ============================================================
CREATE POLICY "favorites_manage_own"
  ON public.favorites FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "favorites_select_own"
  ON public.favorites FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================
-- 14.15 FEATURED SELLERS POLICIES
-- ============================================================
CREATE POLICY "featured_sellers_select_all"
  ON public.featured_sellers FOR SELECT
  USING (is_active = true);

CREATE POLICY "featured_sellers_manage_admin"
  ON public.featured_sellers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================
-- 14.16 DISPUTE REPORTS POLICIES
-- ============================================================
CREATE POLICY "dispute_reports_insert_participant"
  ON public.dispute_reports FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = order_id
      AND (customer_id = auth.uid() OR store_id IN (
        SELECT id FROM public.stores WHERE seller_id = auth.uid()
      ))
  ));

CREATE POLICY "dispute_reports_select_participant"
  ON public.dispute_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id
      AND (o.customer_id = auth.uid()
        OR o.store_id IN (SELECT id FROM public.stores WHERE seller_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  ));

CREATE POLICY "dispute_reports_update_admin"
  ON public.dispute_reports FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================
-- 14.17 ADMIN AUDIT LOGS POLICIES
-- ============================================================
CREATE POLICY "admin_audit_logs_insert_admin"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "admin_audit_logs_select_admin"
  ON public.admin_audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

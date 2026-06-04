# Tofash — Backend Architecture Plan

> **Stack**: Supabase (PostgreSQL + Auth + Storage + Realtime)  
> **Hosting**: Vercel (Next.js frontend), Supabase (backend)  
> **Language**: SQL / TypeScript (Edge Functions)

---

## 1. Database Schema

### 1.1 Entity-Relationship Overview

```
auth.users (managed by Supabase Auth)
  │
  └── profiles (extends auth.users)
        ├── seller_applications  (one user → many applications)
        ├── stores               (one seller → one store)
        │     ├── working_hours  (one store → 7 rows)
        │     ├── seller_holidays
        │     └── products       (one store → many products)
        │           ├── product_images
        │           └── reviews
        ├── carts                (one user → one cart per store)
        │     └── cart_items
        ├── orders               (one user → many orders)
        │     ├── order_items
        │     ├── payment_proofs
        │     ├── chats          (one order → one chat)
        │     │     └── messages
        │     └── dispute_reports
        └── favorites
```

### 1.2 Complete Table Reference

**20 tables** total — all live in `public` schema.

| # | Table | Key Columns | Purpose |
|---|-------|------------|---------|
| 1 | `profiles` | id, phone, full_name, role, is_active | Extends auth.users |
| 2 | `seller_applications` | user_id, government_id_url, status | Pre-approval |
| 3 | `stores` | seller_id, name, slug, is_active, avg_rating | Seller storefront |
| 4 | `working_hours` | store_id, day_of_week, open/close_time | Operational hours |
| 5 | `seller_holidays` | store_id, date, reason | Closed dates |
| 6 | `categories` | name, slug, sort_order | Product classification |
| 7 | `products` | store_id, category_id, name, price, search_vector | Sellable items |
| 8 | `product_images` | product_id, image_url, sort_order | Product gallery |
| 9 | `carts` | user_id, store_id | Per-store cart |
| 10 | `cart_items` | cart_id, product_id, quantity | Cart line items |
| 11 | `orders` | customer_id, store_id, status, order_number | Order root |
| 12 | `order_items` | order_id, product_id, product_name (snap) | Order line items |
| 13 | `payment_proofs` | order_id, image_url, status, verified_by | Payment verification |
| 14 | `chats` | order_id, customer_id, seller_id | Order chat |
| 15 | `messages` | chat_id, sender_id, content, is_read | Chat messages |
| 16 | `reviews` | order_id, product_id, customer_id, rating | Product reviews |
| 17 | `favorites` | user_id, product_id | Saved products |
| 18 | `featured_sellers` | store_id, start_date, end_date | Curated promotion |
| 19 | `dispute_reports` | order_id, reported_by, reason, status | Dispute tracking |
| 20 | `admin_audit_logs` | admin_id, action, entity_type, entity_id | Audit trail |

### 1.3 Key Design Decisions

- **Snapshots in `order_items`**: `product_name`, `product_image`, `unit_price` are copied at order time so historical data survives product changes.
- **`search_vector` on products**: Populated by trigger from `name` + `description` for full-text search via `to_tsvector`/`to_tsquery`.
- **`order_number`**: Human-readable format `TOF-240601-000001` generated via sequence + trigger.
- **Auto-expiry**: `orders.expires_at` set to `now() + 24h` on insert when status is `pending_payment`.
- **Ratings denormalized**: `stores.avg_rating` and `products.avg_rating` updated via triggers on `reviews` insert.

### 1.4 Enums

| Enum | Values |
|------|--------|
| `user_role` | `customer`, `seller`, `admin` |
| `order_status` | `pending_payment`, `pending_verification`, `accepted`, `rejected`, `completed`, `cancelled`, `expired` |
| `fulfillment_type` | `pickup`, `delivery` |
| `schedule_type` | `immediate`, `scheduled` |
| `seller_status` | `pending`, `approved`, `rejected`, `suspended` |
| `dispute_status` | `open`, `resolved`, `dismissed` |

---

## 2. Supabase Auth Setup

### 2.1 Phone OTP Configuration

In Supabase Dashboard → Authentication → Settings:

1. **Enable Phone Auth**: On
2. **Phone Provider**: `vonage` (or twilio depending on Ethiopia coverage)
3. **SMS Provider**: Configure with Ethiopia-compatible provider (Vonage/Twilio with Ethio Telecom support)
4. **OTP Template**: `Your Tofash verification code is {{ .Code }}`
5. **Max Frequency**: 1 OTP per 60 seconds
6. **Phone Format**: International (`+251XXXXXXXXX`)

### 2.2 Auth Trigger: Create Profile on Signup

```sql
-- Automatically creates a profile row when a user signs up via auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, role)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to auth.users trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2.3 Role-Based Access

- **Role stored in `profiles.role`** (NOT in `auth.users.raw_app_meta_data` — easier RLS queries)
- Frontend reads role from `public.profiles` after auth
- To prevent privilege escalation: RLS policy on `profiles` prevents users from changing their own `role`
- Admin role assigned manually via Supabase SQL Editor or Dashboard

### 2.4 Signup Flow

```
1. User enters phone number → Firebase/Supabase sends OTP
2. User enters OTP → Supabase Auth creates auth.users row
3. Auth trigger creates profiles row with role='customer'
4. If user wants to sell → POST to seller_applications (creates pending application)
5. Admin approves → creates/activates store, updates role to 'seller'
```

---

## 3. Storage Buckets

### 3.1 Bucket Configuration

| Bucket | Public | Max Size | MIME Types |
|--------|--------|----------|------------|
| `product-images` | ✅ Public-read | 5 MB | JPEG, PNG, WebP, AVIF |
| `seller-profiles` | ✅ Public-read | 3 MB | JPEG, PNG, WebP |
| `payment-proofs` | ❌ Private | 10 MB | JPEG, PNG, WebP, PDF |
| `banners` | ✅ Public-read | 5 MB | JPEG, PNG, WebP |

### 3.2 Folder Convention

```
product-images/{store_id}/{product_id}/{uuid}.jpg
seller-profiles/{user_id}/{uuid}.jpg
payment-proofs/{order_id}/{uuid}.jpg
banners/{uuid}.jpg
```

### 3.3 Storage RLS Summary

| Bucket | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `product-images` | Everyone | Seller (own store) or Admin | Seller (own store) or Admin | Seller (own store) or Admin |
| `seller-profiles` | Everyone | Self only | Self only | Self only |
| `payment-proofs` | Order participants or Admin | Customer (own order) | No one (immutable) | No one (immutable) |
| `banners` | Everyone | Admin only | Admin only | Admin only |

---

## 4. Real-time Subscriptions

### 4.1 Tables to Subscribe To

| Table | Scope | Reason |
|-------|-------|--------|
| `orders` | Row-level (user's own + seller's own) | Status updates |
| `chats` | Row-level (participant) | New chat created |
| `messages` | Row-level (per chat, per participant) | Live messaging |
| `payment_proofs` | Row-level (order participants) | Proof upload notification |

### 4.2 Channel Design

```typescript
// Frontend: Per-user channels
// Order updates
supabase
  .channel('orders')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'orders',
      filter: `customer_id=eq.${userId}` // OR store_id IN (...)
    },
    (payload) => handleOrderUpdate(payload)
  )
  .subscribe();

// Chat messages (one channel per active chat)
supabase
  .channel(`chat:${chatId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`
    },
    (payload) => appendMessage(payload.new)
  )
  .subscribe();
```

### 4.3 Realtime Publication

In Supabase Dashboard → Database → Replication → enable for:
- `orders` (only INSERT, UPDATE — no DELETE needed)
- `messages`
- `chats`
- `payment_proofs`

> **Note**: For Phase 1, avoid enabling on high-traffic tables like `products` or `reviews`. Use polling or SWR for those.

---

## 5. Database Functions & Triggers

### 5.1 Function Inventory

| Function | Type | Purpose | Schedule |
|----------|------|---------|----------|
| `expire_stale_orders()` | SQL | Marks unpaid orders as `expired` | Every 15 min (pg_cron or Edge Function) |
| `update_store_ratings(uuid)` | SQL | Recalculates store avg_rating + total_ratings | On review insert |
| `update_product_ratings(uuid)` | SQL | Recalculates product avg_rating + total_ratings | On review insert |
| `generate_order_number()` | SQL | Produces `TOF-240601-000001` format | On order insert |
| `get_gmv(date, date)` | SQL | Total completed order revenue | Analytics |
| `get_top_sellers(limit, date, date)` | SQL | Top sellers by order count | Analytics |
| `get_repeat_customer_rate(date, date)` | SQL | % of customers with >1 order | Analytics |

### 5.2 Trigger Inventory

| Trigger | Table | Event | Function |
|---------|-------|-------|----------|
| `trg_profiles_updated_at` | `profiles` | BEFORE UPDATE | `set_updated_at()` |
| `trg_stores_updated_at` | `stores` | BEFORE UPDATE | `set_updated_at()` |
| `trg_products_updated_at` | `products` | BEFORE UPDATE | `set_updated_at()` |
| `trg_products_search` | `products` | BEFORE INSERT OR UPDATE OF name, description | `products_search_update()` |
| `trg_order_insert` | `orders` | BEFORE INSERT | `on_order_insert()` |
| `trg_order_completed` | `orders` | AFTER UPDATE OF status | `on_order_completed()` |
| `trg_review_insert` | `reviews` | AFTER INSERT OR UPDATE | `on_review_insert()` |
| `on_auth_user_created` | `auth.users` | AFTER INSERT | `handle_new_user()` |

### 5.3 Cron: Auto-Expire Orders

**Option A**: Supabase pg_cron (if enabled on your plan)
```sql
SELECT cron.schedule(
  'expire-orders',           -- job name
  '*/15 * * * *',            -- every 15 minutes
  $$SELECT public.expire_stale_orders()$$
);
```

**Option B**: Edge Function (see Section 7)

---

## 6. RLS Policies — Detailed Reference

### 6.1 Policy Matrix

| Table | Anyone (anon) | Customer | Seller | Admin |
|-------|:---:|:---:|:---:|:---:|
| `profiles` | ✗ | Own only | Own + customers who ordered | ALL |
| `seller_applications` | ✗ | Own (insert) | Own (insert) | ALL |
| `stores` | Active only | Active only | Own + active | ALL |
| `working_hours` | ✅ ALL | ✅ ALL | Own | ALL |
| `seller_holidays` | ✅ ALL | ✅ ALL | Own | ALL |
| `categories` | Active only | Active only | Active only | ALL |
| `products` | Active only | Active only | Own + active | ALL |
| `product_images` | ✅ ALL | ✅ ALL | Own | ALL |
| `carts` | ✗ | Own only | ✗ | ✗ |
| `cart_items` | ✗ | Own (via cart) | ✗ | ✗ |
| `orders` | ✗ | Own | Store's orders | ALL |
| `order_items` | ✗ | Own | Own store | ALL |
| `payment_proofs` | ✗ | Own + insert | Store's + update | ALL |
| `chats` | ✗ | Participant | Participant | ALL |
| `messages` | ✗ | Participant + insert + mark-read | Participant + insert + mark-read | ALL |
| `reviews` | ✅ ALL | Insert (verified only) | Read | ALL |
| `favorites` | ✗ | Own | ✗ | ✗ |
| `featured_sellers` | Active only | Active only | Active only | ALL |
| `dispute_reports` | ✗ | Participant + insert | Participant + insert | ALL + update |
| `admin_audit_logs` | ✗ | ✗ | ✗ | ALL |

### 6.2 Critical Policy Details

**Orders — Customer Updates**
```sql
-- Customer can only cancel their own order
CREATE POLICY "orders_update_customer"
  ON public.orders FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid() AND NEW.status IN ('cancelled'));
```

**Orders — Seller Updates**
```sql
-- Seller can accept/reject/complete, but only for their store
CREATE POLICY "orders_update_seller"
  ON public.orders FOR UPDATE
  USING (store_id IN (SELECT id FROM public.stores WHERE seller_id = auth.uid()))
  WITH CHECK (
    store_id IN (SELECT id FROM public.stores WHERE seller_id = auth.uid())
    AND NEW.status IN ('accepted','rejected','completed','pending_payment')
  );
```

**Reviews — Verified Only**
```sql
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
```

---

## 7. Edge Functions

### 7.1 What to Build as Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `expire-orders` | cron (15 min) | Call `expire_stale_orders()` to auto-expire unpaid orders |
| `admin-approve-seller` | HTTP (admin action) | Approve seller application, create store, update role |
| `admin-suspend-seller` | HTTP | Suspend store + seller |
| `notify-order-status` | Database webhook | Send SMS notification on status change |
| `search-products` | HTTP | Full-text search endpoint (optional; can be client-side) |
| `upload-signed-url` | HTTP | Generate signed URL for secure upload (for payment-proofs) |

### 7.2 `expire-orders` Edge Function

```typescript
// supabase/functions/expire-orders/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase.rpc("expire_stale_orders");
  if (error) throw error;

  console.log(`Expired ${data} stale orders`);
  return new Response(JSON.stringify({ expired: data }), { status: 200 });
});
```

Deploy: `supabase functions deploy expire-orders --schedule "*/15 * * * *"`

### 7.3 `admin-approve-seller` Edge Function

```typescript
// Accepts: { application_id }
// 1. Updates seller_application status → 'approved'
// 2. Creates a store row with seller_id
// 3. Updates user profile role → 'seller'
// 4. Logs to admin_audit_logs
```

### 7.4 Notifications Strategy

Phase 1: **Polling + Realtime** (no push notification infrastructure)
- Customer: sees status changes via Realtime subscription on `orders`
- Seller: sees new orders and messages via Realtime
- Future: Edge Function triggered by `pg_webhook` to send SMS via Vonage/Twilio

---

## 8. API Design

### 8.1 Supabase REST API (Auto-generated)

Supabase auto-exposes REST endpoints for all tables. Pattern:

```
GET    /rest/v1/products?select=*,store:stores(*)
POST   /rest/v1/orders
PATCH  /rest/v1/orders?id=eq.{id}
DELETE /rest/v1/cart_items?id=eq.{id}
```

### 8.2 Common Queries

**Search Products**
```typescript
// Full-text search via PostgreSQL
const { data } = await supabase
  .from('products')
  .select('*, store:stores(name, slug, avg_rating)')
  .textSearch('search_vector', searchTerm, {
    type: 'websearch',
    config: 'simple'
  })
  .eq('is_active', true)
  .range(0, 19);
```

**Seller Dashboard — Orders**
```typescript
const { data } = await supabase
  .from('orders')
  .select(`
    *,
    customer:profiles!customer_id(full_name, phone),
    order_items(*),
    payment_proofs(*),
    chat:id()
  `)
  .eq('store_id', storeId)
  .order('created_at', { ascending: false });
```

**Storefront — Products with Images**
```typescript
const { data } = await supabase
  .from('products')
  .select(`
    *,
    product_images(image_url, sort_order),
    category:categories(name, slug)
  `)
  .eq('store_id', storeId)
  .eq('is_available', true)
  .eq('is_active', true)
  .order('created_at', { ascending: false });
```

**Place Order (Transaction-like)**
```typescript
// Step 1: Insert order
const { data: order } = await supabase
  .from('orders')
  .insert({
    customer_id: userId,
    store_id: storeId,
    fulfillment_type: 'pickup',
    schedule_type: 'immediate',
    customer_notes: notes,
    subtotal: calculateSubtotal(items)
  })
  .select()
  .single();

// Step 2: Insert order items
const orderItems = items.map(item => ({
  order_id: order.id,
  product_id: item.product_id,
  product_name: item.product_name,
  product_image: item.product_image,
  quantity: item.quantity,
  unit_price: item.unit_price,
  subtotal: item.unit_price * item.quantity,
  notes: item.notes
}));
await supabase.from('order_items').insert(orderItems);

// Step 3: Create chat
await supabase.from('chats').insert({
  order_id: order.id,
  customer_id: userId,
  seller_id: storeOwnerId
});

// Step 4: Clear cart
await supabase.from('cart_items').delete().eq('cart_id', cartId);
```

### 8.3 GraphQL (Optional)

Supabase also supports GraphQL via `pg_graphql` extension. Enable in Supabase Dashboard → Database → Extensions → `pg_graphql`.

```
POST /graphql/v1
```

For Phase 1, REST is simpler and sufficient.

---

## 9. Data Migration Strategy

### 9.1 File Structure

```
supabase/
├── migrations/
│   ├── 00001_schema.sql        # Tables, enums, functions, triggers, RLS
│   ├── 00002_seed.sql          # Categories seed + admin placeholder
│   └── 00003_functions.sql     # Analytics functions (optional, combined into 00001)
├── seed.sql                    # Run separately for dev seeding
├── storage_buckets.sql         # Storage config (run separately)
└── config.toml                 # Supabase project config
```

### 9.2 Migration Execution

```bash
# Link project
supabase link --project-ref <ref>

# Apply migrations
supabase migration up

# Push seed data
psql "$SUPABASE_DB_URL" -f supabase/migrations/00002_seed.sql

# Configure storage
psql "$SUPABASE_DB_URL" -f supabase/storage_buckets.sql

# Create admin user manually:
# 1. Create user in Supabase Auth UI
# 2. Update profile role: UPDATE profiles SET role='admin' WHERE id='<user_id>';
```

### 9.3 Initial Admin Setup

```sql
-- Run AFTER creating admin via Supabase Auth UI or API
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<AUTH_USER_ID>';

-- Verify
SELECT id, phone, full_name, role FROM public.profiles WHERE role = 'admin';
```

### 9.4 Supabase config.toml

```toml
# supabase/config.toml
[auth]
enabled = true
site_url = "https://tofash.vercel.app"

[auth.sms]
provider = "vonage"
vonage.api_key = "env(VONAGE_API_KEY)"
vonage.api_secret = "env(VONAGE_API_SECRET)"

[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public"]

[db]
migration_dirs = ["supabase/migrations"]

[storage]
enabled = true
file_size_limit = 10485760
```

---

## 10. Order Flow — End-to-End

```
CUSTOMER                          SERVER/DB                        SELLER
────────                          ─────────                        ──────
Browse products
  ──► GET /products?store_id=xx
Add to cart
  ──► POST /cart_items
Place order
  ──► POST /orders (triggers: order_number, expires_at)
  ──► POST /order_items (snapshot names/prices)
  ──► POST /chats (creates chat room)
  ──► DELETE /cart_items (clear cart)
              │
              ▼
Order status: pending_payment
              │
Upload payment proof
  ──► upload to storage/payment-proofs/{order_id}
  ──► POST /payment_proofs
              │
              ▼
Order status: pending_verification
              ├────────────────────────────────► SEES new order in dashboard
              │                                   (via realtime subscription)
              ◄───────────────────────────────── Verifies payment
                                                  PATCH /payment_proofs
                                                  (status: approved)
                                                  PATCH /orders
                                                  (status: accepted)
              │
              ▼
Order status: accepted
              ├────────────────────────────────► Prepares order
              │
Customer picks up / receives delivery
              │
              ◄───────────────────────────────── PATCH /orders
                                                  (status: completed)
              │
              ▼
Order status: completed
              │
Leave review
  ──► POST /reviews (triggers: rating updates)
              │
              ▼
Ratings updated on store + product
```

---

## 11. Performance Notes

| Concern | Solution |
|---------|----------|
| Full-text search | GIN index on `products.search_vector` |
| Order lookups by customer/store | Composite indexes on `(store_id, status)`, `(customer_id)` |
| Unread message count | Partial index on `messages` WHERE `is_read = false` |
| Storefront page load | Single query with `select=*, product_images(*)` join |
| Expired order cleanup | `pg_cron` or Edge Function runs every 15 min |
| Analytics queries | Dedicated `get_*` functions; can be materialized in future |

---

## 12. Future-Proofing (Post-MVP)

- **Payment Escrow**: New `payments` table + `payment_intent_id` column on orders
- **Delivery Tracking**: New `deliveries` table + delivery partner integration
- **Push Notifications**: Edge Function + Firebase Cloud Messaging
- **Seller Subscriptions**: New `subscriptions` table + payment provider
- **Advanced Analytics**: Materialized views for daily rollups
- **Multi-language**: Amharic content via separate `product_translations` table
- **Promotions**: `promotions` table with discount codes applied at checkout

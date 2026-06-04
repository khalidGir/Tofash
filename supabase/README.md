# Tofash — Supabase Backend

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) (v1.8.0+)
- Node.js 18+ (for Edge Function development)
- Docker Desktop (for local development)
- A Supabase account (free tier works for Phase 1)

## Setup

```bash
# 1. Navigate to project root
cd tofash

# 2. Start local Supabase stack
supabase start

# 3. View local dashboard
supabase status
# → Studio URL: http://127.0.0.1:54323
```

## Link to Supabase Project

```bash
# Create a project at https://supabase.com/dashboard/projects
# Then link it:
supabase link --project-ref <your-project-ref>

# Fetch remote secrets locally:
supabase secrets list
```

## Run Migrations

```bash
# Apply all pending migrations (locally):
supabase migration up

# Check migration status:
supabase migration list

# Create a new migration:
supabase migration new <description>
```

### Migration Order

| File | Contents |
|------|----------|
| `00001_schema.sql` | Tables, enums, indexes, functions, triggers, RLS policies |
| `00002_seed.sql` | Categories seed + admin placeholder |
| `00003_auth_triggers.sql` | Auth triggers (`handle_new_user`, `handle_user_delete`) + admin functions |

## Configure Auth (Phone OTP)

1. Go to **Supabase Dashboard → Authentication → Providers → Phone**
2. Enable Phone auth
3. Set **SMS Provider** to **Vonage**
4. Enter your Vonage API Key and API Secret
5. Set **OTP Template**: `Your Tofash verification code is {{ .Code }}`
6. Set **Max Frequency**: 60 seconds
7. Phone numbers should use international format: `+251XXXXXXXXX`

### Environment Variables

Add these to your Supabase project:

```bash
supabase secrets set VONAGE_API_KEY=your_key
supabase secrets set VONAGE_API_SECRET=your_secret
```

## Configure Storage

Run the storage setup SQL in Supabase SQL Editor (not as a migration):

```bash
# Connect and execute:
psql "$SUPABASE_DB_URL" -f supabase/storage_buckets.sql
```

### Buckets Created

| Bucket | Public | Max Size | Access |
|--------|--------|----------|--------|
| `product-images` | ✅ | 5 MB | Public read, seller insert |
| `seller-profiles` | ✅ | 3 MB | Public read, self insert |
| `payment-proofs` | ❌ | 10 MB | Order participants |
| `banners` | ✅ | 5 MB | Admin only |

### Folder Convention

```
product-images/{store_id}/{product_id}/{uuid}.jpg
seller-profiles/{user_id}/{uuid}.jpg
payment-proofs/{order_id}/{uuid}.jpg
banners/{uuid}.jpg
```

## Create Admin User

```bash
# 1. Create a user via Supabase Auth Dashboard or Auth API
# 2. Get the auth user UUID
# 3. Run in SQL Editor:
supabase sql "INSERT INTO public.profiles (id, phone, full_name, role) VALUES ('<AUTH_USER_ID>', '+251911111111', 'Tofash Admin', 'admin');"
# 4. Verify:
supabase sql "SELECT id, phone, full_name, role FROM public.profiles WHERE role = 'admin';"
```

## Deploy Edge Functions

```bash
# Deploy scheduled expire-orders (runs every 15 minutes):
supabase functions deploy expire-orders --schedule "*/15 * * * *"

# Deploy admin HTTP functions:
supabase functions deploy admin-approve-seller --no-verify-jwt
supabase functions deploy admin-reject-seller --no-verify-jwt
supabase functions deploy admin-suspend-seller --no-verify-jwt

# Get function URL:
supabase functions list
```

### Function Descriptions

| Function | Trigger | Description |
|----------|---------|-------------|
| `expire-orders` | Cron (15 min) | Calls `expire_stale_orders()` to auto-expire unpaid orders |
| `admin-approve-seller` | HTTP POST | Approves seller application, creates store, updates role |
| `admin-reject-seller` | HTTP POST | Rejects seller application with optional reason |
| `admin-suspend-seller` | HTTP POST | Suspends a seller's store and profile |

### Environment Variables for Functions

These are set automatically by Supabase, but verify:

- `SUPABASE_URL` — your project URL
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (kept secret)

## Test Edge Functions Locally

```bash
# Serve functions locally:
supabase functions serve --env-file ./supabase/.env.local

# Test expire-orders:
curl http://127.0.0.1:54321/functions/v1/expire-orders

# Test admin-approve-seller:
curl -X POST http://127.0.0.1:54321/functions/v1/admin-approve-seller \
  -H "Authorization: Bearer <admin-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"application_id": "<uuid>"}'
```

## Realtime Subscriptions

In **Supabase Dashboard → Database → Replication**, enable replication for:

- `orders` (INSERT, UPDATE)
- `messages`
- `chats`
- `payment_proofs`

## Project Structure

```
supabase/
├── config.toml                 # Supabase project configuration
├── .gitignore                  # Supabase-specific ignores
├── seed.sql                    # Development seed data
├── storage_buckets.sql         # Storage bucket setup (run manually)
├── README.md                   # This file
├── migrations/
│   ├── 00001_schema.sql        # Full schema (tables, indexes, triggers, RLS)
│   ├── 00002_seed.sql          # Category seeds + admin placeholder
│   └── 00003_auth_triggers.sql # Auth triggers + admin functions
└── functions/
    ├── expire-orders/
    │   └── index.ts            # Cron: auto-expire unpaid orders
    ├── admin-approve-seller/
    │   └── index.ts            # HTTP: approve seller application
    ├── admin-reject-seller/
    │   └── index.ts            # HTTP: reject seller application
    └── admin-suspend-seller/
        └── index.ts            # HTTP: suspend seller
```

## Useful Commands

```bash
supabase status                  # Check local services
supabase stop                    # Stop local stack
supabase db dump                 # Dump remote DB (for backup)
supabase db diff                 # Diff local vs remote schema
supabase secrets list            # List environment secrets
supabase functions logs          # View function logs (remote)
```

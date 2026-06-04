# Tofash — Frontend Architecture Plan

> **Stack**: Next.js (App Router) + TailwindCSS + Supabase (client)  
> **PWA**: `@serwist/next` (modern next-pwa fork)  
> **i18n**: `next-intl` (English + Amharic)  
> **State**: Zustand (client state) + TanStack React Query (server state)  
> **Forms**: React Hook Form + Zod  
> **Hosting**: Vercel

---

## 1. Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (guest)/                   # Public routes (no auth required)
│   │   ├── layout.tsx             # Guest layout (minimal header/footer)
│   │   ├── page.tsx               # Home / Landing
│   │   ├── search/page.tsx
│   │   ├── sellers/[slug]/page.tsx # Seller storefront
│   │   └── products/[slug]/page.tsx
│   ├── (auth)/                    # Auth routes
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (customer)/                # Customer dashboard (auth required)
│   │   ├── layout.tsx             # Customer layout (nav, sidebar)
│   │   ├── orders/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   ├── favorites/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── chat/[id]/page.tsx
│   ├── (seller)/                  # Seller dashboard
│   │   ├── layout.tsx             # Seller layout (sidebar nav)
│   │   ├── dashboard/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/new/page.tsx
│   │   ├── products/[id]/edit/page.tsx
│   │   ├── settings/page.tsx
│   │   └── chat/page.tsx
│   ├── (admin)/                   # Admin panel
│   │   ├── layout.tsx             # Admin layout
│   │   ├── sellers/page.tsx
│   │   ├── sellers/[id]/page.tsx
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── disputes/page.tsx
│   │   └── analytics/page.tsx
│   ├── api/                       # Route handlers (if needed)
│   └── layout.tsx                 # Root layout (fonts, metadata, providers)
│
├── components/
│   ├── ui/                        # Primitives (design system)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── StarRating.tsx
│   │   ├── FileUpload.tsx
│   │   ├── Toast.tsx
│   │   ├── Skeleton.tsx
│   │   └── EmptyState.tsx
│   ├── features/                  # Domain components
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── SellerCard.tsx
│   │   ├── CartItem.tsx
│   │   ├── OrderCard.tsx
│   │   ├── OrderTimeline.tsx
│   │   ├── PaymentProofUpload.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── ChatInbox.tsx
│   │   ├── ReviewForm.tsx
│   │   ├── SellerApplicationForm.tsx
│   │   └── SearchBar.tsx
│   ├── layout/                    # Shell components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNav.tsx
│   │   ├── Sidebar.tsx
│   │   └── AuthGuard.tsx
│   └── providers/                 # Context providers
│       ├── AuthProvider.tsx
│       ├── CartProvider.tsx
│       └── QueryProvider.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   ├── server.ts              # Server Supabase client
│   │   └── admin.ts               # Service role client (admin only)
│   ├── auth/
│   │   ├── middleware.ts          # Route protection
│   │   └── helpers.ts             # getProfile, getRole
│   ├── queries/                   # React Query hooks
│   │   ├── useProducts.ts
│   │   ├── useOrders.ts
│   │   ├── useCart.ts
│   │   ├── useChat.ts
│   │   ├── useStores.ts
│   │   ├── useReviews.ts
│   │   └── useFavorites.ts
│   ├── mutations/                 # React Query mutations
│   │   ├── usePlaceOrder.ts
│   │   ├── useUploadPaymentProof.ts
│   │   ├── useCreateProduct.ts
│   │   └── useVerifyPayment.ts
│   ├── stores/                    # Zustand stores
│   │   ├── cartStore.ts
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── validations/              # Zod schemas
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── review.ts
│   │   └── seller.ts
│   └── utils/
│       ├── cn.ts                  # clsx + tailwind-merge
│       ├── format.ts              # Price, date, phone formatting
│       └── constants.ts           # Order statuses, routes, enums
│
├── hooks/
│   ├── useDebounce.ts
│   ├── usePWA.ts
│   └── useOnlineStatus.ts
│
├── i18n/
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── order.json
│   │   ├── seller.json
│   │   └── admin.json
│   ├── am/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── order.json
│   │   ├── seller.json
│   │   └── admin.json
│   └── request.ts                 # next-intl config
│
├── types/
│   ├── supabase.ts                # Generated types (supabase gen types)
│   ├── models.ts                  # Store, Product, Order, etc.
│   └── forms.ts                   # Form input types
│
├── public/
│   ├── icons/
│   ├── images/
│   ├── manifest.json
│   ├── sw.js                      # Service worker
│   └── fonts/                     # Amharic-compatible fonts
│
└── middleware.ts                  # Next.js middleware (auth + i18n)
```

---

## 2. Route Design

### Route Groups & Access Control

| Group | Auth Required | Layout | Pages |
|-------|:---:|--------|-------|
| `(guest)` | ❌ | Guest layout (header, footer, search bar) | Home, Search, Seller Storefront, Product Page |
| `(auth)` | ❌ | Centered card layout | Login with OTP, Register |
| `(customer)` | ✅ Customer | Sidebar + top nav | Orders, Order Detail, Favorites, Cart, Checkout, Chat |
| `(seller)` | ✅ Seller | Sidebar dashboard | Dashboard, Orders, Products (CRUD), Settings, Chat Inbox |
| `(admin)` | ✅ Admin | Sidebar admin | Seller Management, Product Moderation, Orders, Disputes, Analytics |

### Loading & Error States

```
- root-loading.tsx      # Global loading spinner
- root-error.tsx        # Global error boundary
- (guest)/loading.tsx   # Skeleton grid for products
- (customer)/loading.tsx
- (seller)/orders/loading.tsx   # Table skeleton
```

Root layout wraps everything in:
- `QueryProvider` (TanStack React Query)
- `AuthProvider` (Supabase session listener)
- `CartProvider` (Zustand cart persistence)
- `next-intl` provider
- PWA meta tags + manifest link

---

## 3. Component Tree

### UI Primitives (design system)
All built with TailwindCSS, following the "feminine, warm, premium homemade" brand:
- Rounded corners (`rounded-xl`/`rounded-2xl`)
- Warm colors (rose, amber, cream accents)
- Soft shadows
- Large imagery

| Component | Props | Notes |
|-----------|-------|-------|
| `Button` | variant, size, loading, icon | `primary` (rose), `secondary` (white), `ghost`, `danger` |
| `Card` | padding, shadow, hover | Base card with rounded corners |
| `Input` | label, error, icon, helperText | With floating label option |
| `FileUpload` | accept, maxSize, preview | Drag & drop + click; image preview |
| `StarRating` | value, onChange, readonly | 1-5 stars display/interaction |
| `Badge` | variant, size | Status badges (pending, accepted, completed) |
| `Skeleton` | variant (text/circular/rectangular) | Loading placeholders |
| `EmptyState` | icon, title, description, action | For empty carts, no orders, etc. |
| `Toast` | type, message, duration | Success/error notifications |
| `Modal` | open, onClose, title, size | Slide-up on mobile, centered on desktop |

### Feature Components

| Component | Props | Description |
|-----------|-------|-------------|
| `ProductCard` | product, onAddToCart | Image, name, price, rating, store name, add-to-cart |
| `ProductGrid` | products, loading, empty | Responsive grid (2 cols mobile, 3-4 desktop) |
| `SellerCard` | store, distance | Logo, name, rating, preparation time, featured badge |
| `CartItem` | item, onUpdateQty, onRemove | Product image, name, qty control, price, notes |
| `OrderCard` | order, role | Order number, status badge, items summary, actions |
| `OrderTimeline` | status, timestamps | Visual timeline: placed → paid → accepted → completed |
| `PaymentProofUpload` | orderId, onUpload | Upload area, preview, submit button |
| `ChatBubble` | message, isOwn | Aligned left/right, time, read receipt |
| `ChatInbox` | chats[], userId | List of order chats with last message preview |
| `ReviewForm` | productId, orderId | Star rating + text area + submit |
| `SearchBar` | onSearch, placeholder | Debounced input with clear button |

---

## 4. State Management Strategy

### Zustand (Client-only state)

| Store | State | Persistence |
|-------|-------|:-----------:|
| `cartStore` | items[], storeId, notes | ✅ localStorage |
| `authStore` | session, profile, role | Partial (role from profile) |
| `uiStore` | sidebarOpen, modals, toasts | ❌ |

### TanStack React Query (Server state)

| Query Key | Data | Cache Time |
|-----------|------|:----------:|
| `['products', { storeId, categoryId }]` | Product[] | 5 min |
| `['product', slug]` | Product | 10 min |
| `['stores', { featured }]` | Store[] | 10 min |
| `['store', slug]` | Store | 10 min |
| `['orders', { role, status }]` | Order[] | 30 sec (poll) |
| `['order', id]` | Order | 30 sec |
| `['cart', userId]` | Cart + items | 1 min |
| `['chats', userId]` | Chat[] | 30 sec |
| `['messages', chatId]` | Message[] | Real-time |
| `['reviews', productId]` | Review[] | 5 min |
| `['search', query]` | (Product + Store)[] | 2 min |

### Real-Time Subscriptions

```typescript
// Live chat messages
useEffect(() => {
  const channel = supabase
    .channel(`chat:${chatId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
      (payload) => queryClient.setQueryData(['messages', chatId], (old) => [...old, payload.new])
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [chatId]);

// Live order status updates
useEffect(() => {
  const channel = supabase
    .channel('my-orders')
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders', filter: `customer_id=eq.${userId}` },
      (payload) => queryClient.invalidateQueries({ queryKey: ['orders'] })
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [userId]);
```

---

## 5. Data Flow

### Server Components → Client Components

```typescript
// app/(guest)/page.tsx — Server Component
export default async function HomePage() {
  const supabase = createServerClient();
  const { data: featured } = await supabase
    .from('stores')
    .select('*, products(*)')
    .eq('is_featured', true)
    .limit(6);

  return <FeaturedSellers initialData={featured} />;
}

// components/features/FeaturedSellers.tsx — Client Component
'use client';
export function FeaturedSellers({ initialData }) {
  const { data } = useQuery({
    queryKey: ['stores', 'featured'],
    queryFn: fetchFeaturedSellers,
    initialData, // Hydrate from server
  });
  return <ProductGrid products={data} />;
}
```

### When to use Server vs Client

| Use Server Component | Use Client Component |
|---------------------|---------------------|
| Static/SEO pages | Cart, checkout, chat |
| Initial data fetch | Interactive forms |
| i18n message loading | Real-time updates |
| Metadata generation | Animations/transitions |
| Auth redirect logic | Draggable, file uploads |

### Supabase Client Helpers

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
};
```

---

## 6. PWA Strategy

### Using `@serwist/next`

```typescript
// next.config.ts
import withSerwist from '@serwist/next';

const withPWA = withSerwist({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

export default withPWA({
  // ... other Next.js config
});
```

### Service Worker Caching Strategy

| Asset Type | Strategy |
|------------|----------|
| Pages (HTML) | NetworkFirst, 30s timeout → cache |
| Static assets (JS/CSS) | StaleWhileRevalidate |
| Images (Supabase Storage) | CacheFirst (7 days) |
| API responses | NetworkOnly (auth required) |
| Fonts | CacheFirst (30 days) |

### Offline Capabilities (Phase 1)
- Show cached pages
- Graceful offline indicator banner
- Cart persists in localStorage (Zustand + persist middleware)
- Forms disabled with "You're offline" message
- Full offline support: Post-MVP

### Manifest Configuration

```json
{
  "name": "Tofash — Homemade Desserts",
  "short_name": "Tofash",
  "description": "Discover homemade desserts from trusted sellers in Addis Ababa",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#E11D48",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 7. i18n Strategy

### Using `next-intl`

```typescript
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./${locale}/common.json`)).default,
}));

// middleware.ts — locale detection
import createMiddleware from 'next-intl/middleware';
export default createMiddleware({
  locales: ['en', 'am'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // /en/products or /am/products
});

export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
```

### Locale-Specific Considerations

| Concern | Solution |
|---------|----------|
| Language toggle | Header dropdown, persisted in cookie |
| Amharic fonts | Noto Sans Ethiopic (Google Fonts), preloaded |
| RTL | Amharic is LTR (no RTL issues) |
| Number formatting | Different separators per locale |
| Price formatting | ETB symbol (ብር / Br) per locale |
| Date formatting | Ethiopian calendar? → Post-MVP. Use Gregorian for now |

### Translation File Structure

```json
// i18n/en/order.json
{
  "status": {
    "pending_payment": "Pending Payment",
    "pending_verification": "Pending Verification",
    "accepted": "Accepted",
    "rejected": "Rejected",
    "completed": "Completed",
    "cancelled": "Cancelled",
    "expired": "Expired"
  },
  "actions": {
    "place_order": "Place Order",
    "upload_proof": "Upload Payment Proof",
    "cancel": "Cancel Order"
  }
}
```

---

## 8. Authentication Flow

### OTP Phone Auth with Supabase

```typescript
// Step 1: Send OTP
const { error } = await supabase.auth.signInWithOtp({
  phone: '+251912345678',
});

// Step 2: Verify OTP
const { data, error } = await supabase.auth.verifyOtp({
  phone: '+251912345678',
  token: '123456',
  type: 'sms',
});

// Step 3: Read profile + role
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', data.user.id)
  .single();

// Role-based redirect
if (profile.role === 'seller') redirect('/seller/dashboard');
if (profile.role === 'admin') redirect('/admin/sellers');
redirect('/'); // customer
```

### Middleware Route Protection

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => request.cookies.get(name)?.value } }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = request.nextUrl.pathname;

  // Role-based guard
  if (pathname.startsWith('/seller') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check role for seller/admin routes
  if (pathname.startsWith('/seller') || pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname.startsWith('/seller') && profile?.role !== 'seller') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/customer/:path*', '/seller/:path*', '/admin/:path*'],
};
```

---

## 9. Form Design Patterns

### Consistent approach: React Hook Form + Zod

```typescript
// lib/validations/product.ts
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
```

```typescript
// components/features/ProductForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '@/lib/validations/product';

export function ProductForm({ initialData }: { initialData?: ProductFormData }) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ?? { is_available: true },
  });

  const onSubmit = async (data: ProductFormData) => {
    // Upload images → get URLs → insert product → insert product_images
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input label="Product Name" {...form.register('name')} error={form.formState.errors.name} />
      <Input label="Price (ETB)" type="number" step="0.01" {...form.register('price')} />
      <FileUpload
        label="Product Images"
        accept="image/*"
        maxFiles={5}
        onChange={(files) => form.setValue('images', files)}
      />
      <Button type="submit" loading={form.formState.isSubmitting}>
        {initialData ? 'Update Product' : 'Add Product'}
      </Button>
    </form>
  );
}
```

### Key Forms

| Form | Schema | Fields |
|------|--------|--------|
| Login | `phone: string + OTP` | Phone input + OTP code inputs |
| Checkout | `checkoutSchema` | Fulfillment type, schedule, notes |
| Payment Proof | `paymentProofSchema` | File upload (image/PDF) + optional note |
| Seller Application | `sellerSchema` | Full name, phone, ID upload, store name, social links, payment info, location |
| Product (CRUD) | `productSchema` | Name, desc, price, category, images, availability |
| Store Settings | `settingsSchema` | Working hours (7 days), prep time, pickup/delivery toggles |
| Review | `reviewSchema` | Star rating + text |

---

## 10. Design System Tokens

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
        },
        warm: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
        },
        cream: '#FFFDF5',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Ethiopic', 'sans-serif'],
        display: ['Playfair Display', 'serif'], // For headings
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
};
```

---

## 11. Implementation Roadmap (6 Weeks)

| Week | Milestone |
|:----:|-----------|
| **1** | Project scaffold: Next.js setup, Tailwind config, Supabase client, folder structure, types generation |
| **2** | Auth flow: OTP phone login, middleware, AuthGuard, profile creation |
| **3** | Guest pages: Home (featured, categories), Search, Product Page, Seller Storefront |
| **4** | Cart & Checkout: Zustand cart, add/remove items, checkout form, payment proof upload |
| **5** | Customer Dashboard: Orders list, order detail, order timeline, chat |
| **6** | Seller Dashboard + Admin Panel: Product CRUD, order management, settings, admin seller management |

---

## 12. Key Conventions

- **Naming**: PascalCase for components, camelCase for hooks/utils, kebab-case for files
- **Components**: Default export for pages, named export for everything else
- **Types**: Generated from Supabase (`supabase gen types --lang=typescript`)
- **CSS**: Tailwind utility classes, extract to `className` vars only when repeating 3+ times
- **Error handling**: Every mutation wraps in try/catch + toast notification
- **Loading states**: Every data-dependent component has a Skeleton variant
- **Empty states**: Every list component has an EmptyState fallback

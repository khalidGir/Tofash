'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { formatPrice } from '@/lib/utils/format';
import type { Product, Store, Category } from '@/types/models';
import { ProductGrid } from '@/components/features/ProductGrid';
import { SellerCard } from '@/components/features/SellerCard';
import { CategoryCard } from '@/components/features/CategoryCard';
import { Button } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

const MOCK_FEATURED: Store[] = [
 { id: '1', seller_id: 's1', name: 'Sweet Tooth Bakery', slug: 'sweet-tooth-bakery', description: null, logo_url: null, banner_url: null, is_featured: true, is_active: true, preparation_time_minutes: 30, created_at: '', updated_at: '' },
 { id: '2', seller_id: 's2', name: 'Mama T\'s Kitchen', slug: 'mama-ts-kitchen', description: null, logo_url: null, banner_url: null, is_featured: true, is_active: true, preparation_time_minutes: 45, created_at: '', updated_at: '' },
 { id: '3', seller_id: 's3', name: 'Cake Paradise', slug: 'cake-paradise', description: null, logo_url: null, banner_url: null, is_featured: true, is_active: true, preparation_time_minutes: 60, created_at: '', updated_at: '' },
 { id: '4', seller_id: 's4', name: 'Cookie Jar', slug: 'cookie-jar', description: null, logo_url: null, banner_url: null, is_featured: true, is_active: true, preparation_time_minutes: 20, created_at: '', updated_at: '' },
 { id: '5', seller_id: 's5', name: 'Ethio Desserts', slug: 'ethio-desserts', description: null, logo_url: null, banner_url: null, is_featured: true, is_active: true, preparation_time_minutes: 35, created_at: '', updated_at: '' },
 { id: '6', seller_id: 's6', name: 'Frost & Bake', slug: 'frost-and-bake', description: null, logo_url: null, banner_url: null, is_featured: true, is_active: true, preparation_time_minutes: 40, created_at: '', updated_at: '' },
];

const MOCK_CATEGORIES: Category[] = [
 { id: 'c1', name: 'Cakes', slug: 'cake', description: null, image_url: null, parent_id: null, created_at: '' },
 { id: 'c2', name: 'Cookies', slug: 'cookie', description: null, image_url: null, parent_id: null, created_at: '' },
 { id: 'c3', name: 'Pastries', slug: 'pastry', description: null, image_url: null, parent_id: null, created_at: '' },
 { id: 'c4', name: 'Puddings', slug: 'pudding', description: null, image_url: null, parent_id: null, created_at: '' },
 { id: 'c5', name: 'Ice Cream', slug: 'ice-cream', description: null, image_url: null, parent_id: null, created_at: '' },
 { id: 'c6', name: 'Breads', slug: 'bread', description: null, image_url: null, parent_id: null, created_at: '' },
 { id: 'c7', name: 'Drinks', slug: 'drinks', description: null, image_url: null, parent_id: null, created_at: '' },
 { id: 'c8', name: 'Specialty', slug: 'specialty', description: null, image_url: null, parent_id: null, created_at: '' },
];

const MOCK_TRENDING: Product[] = [
 { id: 'p1', store_id: '1', category_id: 'c1', name: 'Chocolate Fudge Cake', slug: 'chocolate-fudge-cake', description: null, price: 450, compare_at_price: 550, images: [], is_available: true, preparation_time_minutes: 45, created_at: '2025-01-01', updated_at: '2025-01-01', store: MOCK_FEATURED[0] },
 { id: 'p2', store_id: '2', category_id: 'c2', name: 'Ethiopian Spiced Cookies', slug: 'ethiopian-spiced-cookies', description: null, price: 180, compare_at_price: null, images: [], is_available: true, preparation_time_minutes: 20, created_at: '2025-01-02', updated_at: '2025-01-02', store: MOCK_FEATURED[1] },
 { id: 'p3', store_id: '3', category_id: 'c1', name: 'Strawberry Cheesecake', slug: 'strawberry-cheesecake', description: null, price: 380, compare_at_price: 420, images: [], is_available: true, preparation_time_minutes: 60, created_at: '2025-01-03', updated_at: '2025-01-03', store: MOCK_FEATURED[2] },
 { id: 'p4', store_id: '4', category_id: 'c3', name: 'Creamy Custard Pastry', slug: 'creamy-custard-pastry', description: null, price: 220, compare_at_price: null, images: [], is_available: true, preparation_time_minutes: 25, created_at: '2025-01-04', updated_at: '2025-01-04', store: MOCK_FEATURED[3] },
 { id: 'p5', store_id: '5', category_id: 'c4', name: 'Traditional Firfir Pudding', slug: 'traditional-firfir-pudding', description: null, price: 150, compare_at_price: null, images: [], is_available: false, preparation_time_minutes: 15, created_at: '2025-01-05', updated_at: '2025-01-05', store: MOCK_FEATURED[4] },
 { id: 'p6', store_id: '6', category_id: 'c5', name: 'Mango Ice Cream Tub', slug: 'mango-ice-cream-tub', description: null, price: 280, compare_at_price: 350, images: [], is_available: true, preparation_time_minutes: 10, created_at: '2025-01-06', updated_at: '2025-01-06', store: MOCK_FEATURED[5] },
 { id: 'p7', store_id: '1', category_id: 'c1', name: 'Red Velvet Cupcakes (4pk) ', slug: 'red-velvet-cupcakes-4pk', description: null, price: 320, compare_at_price: null, images: [], is_available: true, preparation_time_minutes: 30, created_at: '2025-01-07', updated_at: '2025-01-07', store: MOCK_FEATURED[0] },
 { id: 'p8', store_id: '2', category_id: 'c6', name: 'Honey & Butter Bread', slug: 'honey-butter-bread', description: null, price: 120, compare_at_price: 150, images: [], is_available: true, preparation_time_minutes: 50, created_at: '2025-01-08', updated_at: '2025-01-08', store: MOCK_FEATURED[1] },
];

const MOCK_NEW: Product[] = [
 { id: 'p9', store_id: '3', category_id: 'c1', name: 'Vegan Carrot Cake', slug: 'vegan-carrot-cake', description: null, price: 410, compare_at_price: null, images: [], is_available: true, preparation_time_minutes: 55, created_at: '2025-06-01', updated_at: '2025-06-01', store: MOCK_FEATURED[2] },
 { id: 'p10', store_id: '4', category_id: 'c2', name: 'Macadamia White Choc Cookies', slug: 'macadamia-white-choc-cookies', description: null, price: 200, compare_at_price: null, images: [], is_available: true, preparation_time_minutes: 20, created_at: '2025-06-02', updated_at: '2025-06-02', store: MOCK_FEATURED[3] },
 { id: 'p11', store_id: '5', category_id: 'c7', name: 'Spiced Tea Mix', slug: 'spiced-tea-mix', description: null, price: 90, compare_at_price: 120, images: [], is_available: true, preparation_time_minutes: 5, created_at: '2025-06-03', updated_at: '2025-06-03', store: MOCK_FEATURED[4] },
];

function addToCart(product: Product) {
 useCartStore.getState().addItem({
 id:`${product.id}-${Date.now()}`,
 product_id: product.id,
 store_id: product.store_id,
 product_name: product.name,
 product_image: product.images?.[0] || null,
 unit_price: product.price,
 quantity: 1,
 notes: '',
 store_name: product.store?.name,
 });
}

export default function HomePage() {
 const [featuredLoading, setFeaturedLoading] = useState(true);
 const [trendingLoading, setTrendingLoading] = useState(true);
 const [newLoading, setNewLoading] = useState(true);

 useEffect(() => {
 const t1 = setTimeout(() => setFeaturedLoading(false), 600);
 const t2 = setTimeout(() => setTrendingLoading(false), 800);
 const t3 = setTimeout(() => setNewLoading(false), 400);
 return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
 }, []);

 return (
 <div>
 <section className="relative overflow-hidden bg-gradient-to-br from-coral-crimson/5 via-cream to-coral-crimson/5">
 <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
 <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:justify-between lg:items-center gap-8">
 <div className="max-w-lg">
 <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-coral-crimson">
 Discover homemade desserts
 </h1>
 <p className="mt-4 text-base sm:text-lg text-coral-crimson/70">
 from trusted sellers in Addis Ababa
 </p>
 <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
 <Link href="/search">
 <Button variant="primary" size="lg">
 Browse Desserts
 </Button>
 </Link>
 <Link href="/sellers">
 <Button variant="secondary" size="lg">
 Find Sellers
 </Button>
 </Link>
 </div>
 </div>
 <div className="relative h-48 w-48 sm:h-64 sm:w-64 lg:h-80 lg:w-80">
 <div className="absolute inset-0 rounded-full bg-gradient-to-br from-coral-crimson/20 via-coral-crimson/30 to-coral-crimson/30 opacity-30 blur-3xl" />
 <div className="relative flex h-full w-full items-center justify-center">
 <svg className="h-32 w-32 sm:h-40 sm:w-40 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
 </svg>
 </div>
 </div>
 </div>
 </div>
 </section>

 <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
 <div className="mb-6 flex items-center justify-between">
 <h2 className="font-display text-2xl font-bold text-coral-crimson">Featured Sellers</h2>
 <Link href="/search" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
 View all
 </Link>
 </div>
 {featuredLoading ? (
 <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
 {Array.from({ length: 6 }).map((_, i) => (
 <div key={i} className="rounded-[90px] bg-pure-white overflow-hidden">
 <Skeleton variant="rectangular" className="h-24 sm:h-32 w-full" />
 <div className="p-4 space-y-2">
 <Skeleton variant="circular" className="h-12 w-12 -mt-8 border-2 border-white" />
 <Skeleton variant="text" className="h-4 w-3/4" />
 <Skeleton variant="text" className="h-3 w-1/2" />
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-2 md:snap-none lg:grid-cols-3 xl:grid-cols-6">
 {MOCK_FEATURED.map((store) => (
 <SellerCard key={store.id} store={store} className="min-w-[200px] snap-start md:min-w-0" />
 ))}
 </div>
 )}
 </section>

 <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
 <h2 className="mb-6 font-display text-2xl font-bold text-coral-crimson">Categories</h2>
 <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
 {MOCK_CATEGORIES.map((cat) => (
 <CategoryCard key={cat.id} category={cat} />
 ))}
 </div>
 </section>

 <section className="bg-pure-white">
 <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
 <div className="mb-6 flex items-center justify-between">
 <h2 className="font-display text-2xl font-bold text-coral-crimson">Trending Desserts</h2>
 <Link href="/search?sort=trending" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
 View all
 </Link>
 </div>
 <ProductGrid
 products={trendingLoading ? [] : MOCK_TRENDING}
 loading={trendingLoading}
 emptyMessage="No trending desserts right now"
 columns={4}
 onAddToCart={addToCart}
 />
 </div>
 </section>

 <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
 <div className="mb-6 flex items-center justify-between">
 <h2 className="font-display text-2xl font-bold text-coral-crimson">New Arrivals</h2>
 <Link href="/search?sort=newest" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
 View all
 </Link>
 </div>
 <ProductGrid
 products={newLoading ? [] : MOCK_NEW}
 loading={newLoading}
 emptyMessage="No new arrivals yet"
 columns={4}
 onAddToCart={addToCart}
 />
 </section>
 </div>
 );
}

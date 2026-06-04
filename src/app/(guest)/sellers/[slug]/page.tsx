'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cartStore';
import { formatPrice } from '@/lib/utils/format';
import type { Store, Product } from '@/types/models';
import { ProductGrid } from '@/components/features/ProductGrid';
import StarRating from '@/components/ui/StarRating';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';

const MOCK_STORES: Record<string, Store & { products: Product[] }> = {
'sweet-tooth-bakery': {
 id: '1', seller_id: 's1', name: 'Sweet Tooth Bakery', slug: 'sweet-tooth-bakery',
 description: 'We bake fresh daily with love and the finest ingredients. Specializing in custom cakes, cupcakes, and pastries for every occasion.',
 logo_url: null, banner_url: null, is_featured: true, is_active: true,
 preparation_time_minutes: 30, created_at: '2025-01-01', updated_at: '2025-01-01',
 products: [
 { id: 'p1', store_id: '1', category_id: 'c1', name: 'Chocolate Fudge Cake', slug: 'chocolate-fudge-cake', description: 'Rich, moist chocolate cake with creamy fudge frosting.', price: 450, compare_at_price: 550, images: [], is_available: true, preparation_time_minutes: 45, created_at: '2025-01-01', updated_at: '2025-01-01' },
 { id: 'p7', store_id: '1', category_id: 'c1', name: 'Red Velvet Cupcakes (4pk) ', slug: 'red-velvet-cupcakes-4pk', description: 'Classic red velvet with cream cheese frosting.', price: 320, compare_at_price: null, images: [], is_available: true, preparation_time_minutes: 30, created_at: '2025-01-07', updated_at: '2025-01-07' },
 { id: 'p12', store_id: '1', category_id: 'c3', name: 'Vanilla Éclair', slug: 'vanilla-eclair', description: 'Choux pastry filled with vanilla custard.', price: 180, compare_at_price: null, images: [], is_available: true, preparation_time_minutes: 25, created_at: '2025-02-01', updated_at: '2025-02-01' },
 { id: 'p13', store_id: '1', category_id: 'c2', name: 'Double Choc Chip Cookies (6pk) ', slug: 'double-choc-chip-cookies', description: 'Soft-baked double chocolate chip cookies.', price: 250, compare_at_price: 300, images: [], is_available: true, preparation_time_minutes: 20, created_at: '2025-02-10', updated_at: '2025-02-10' },
 ],
 },
'mama-ts-kitchen': {
 id: '2', seller_id: 's2', name:"Mama T's Kitchen", slug: 'mama-ts-kitchen',
 description: 'Homestyle Ethiopian desserts made from generations-old family recipes.',
 logo_url: null, banner_url: null, is_featured: true, is_active: true,
 preparation_time_minutes: 45, created_at: '2025-01-02', updated_at: '2025-01-02',
 products: [
 { id: 'p2', store_id: '2', category_id: 'c2', name: 'Ethiopian Spiced Cookies', slug: 'ethiopian-spiced-cookies', description: 'Cookies infused with berbere, cardamom, and honey.', price: 180, compare_at_price: null, images: [], is_available: true, preparation_time_minutes: 20, created_at: '2025-01-02', updated_at: '2025-01-02' },
 { id: 'p8', store_id: '2', category_id: 'c6', name: 'Honey & Butter Bread', slug: 'honey-butter-bread', description: 'Soft yeast bread brushed with honey butter.', price: 120, compare_at_price: 150, images: [], is_available: true, preparation_time_minutes: 50, created_at: '2025-01-08', updated_at: '2025-01-08' },
 ],
 },
};

const CATEGORY_TABS = ['All', 'Cakes', 'Cookies', 'Pastries', 'Puddings', 'Breads'];

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
 store_name: undefined,
 });
}

export default function SellerStorefrontPage() {
 const params = useParams<{ slug: string }>();
 const slug = params.slug;

 const [loading, setLoading] = useState(true);
 const [store, setStore] = useState<(Store & { products: Product[] }) | null>(null);
 const [activeTab, setActiveTab] = useState('All');

 useEffect(() => {
 setLoading(true);
 const timer = setTimeout(() => {
 const found = MOCK_STORES[slug];
 if (found) {
 setStore(found);
 } else {
 setStore(null);
 }
 setLoading(false);
 }, 500);
 return () => clearTimeout(timer);
 }, [slug]);

 if (loading) {
 return (
 <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
 <Skeleton variant="rectangular" className="h-40 sm:h-56 w-full rounded-[90px] mb-6" />
 <div className="flex items-center gap-4 mb-6">
 <Skeleton variant="circular" className="h-16 w-16" />
 <div className="space-y-2">
 <Skeleton variant="text" className="h-6 w-48" />
 <Skeleton variant="text" className="h-4 w-32" />
 </div>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
 {Array.from({ length: 4 }).map((_, i) => (
 <div key={i} className="rounded-[90px] bg-pure-white p-4">
 <Skeleton variant="rectangular" className="aspect-square w-full rounded-[90px] mb-3" />
 <Skeleton variant="text" className="h-4 w-3/4 mb-2" />
 <Skeleton variant="text" className="h-3 w-1/2" />
 </div>
 ))}
 </div>
 </div>
 );
 }

 if (!store) {
 notFound();
 }

 const filteredProducts = activeTab === 'All'
 ? store.products
 : store.products.filter((p) => {
 const catMap: Record<string, string> = {'p1': 'Cakes', 'p7': 'Cakes', 'p12': 'Pastries', 'p13': 'Cookies', 'p2': 'Cookies', 'p8': 'Breads' };
 return catMap[p.id] === activeTab;
 });

 const averageRating = 4.5;

 return (
 <div>
 <div className="relative h-40 sm:h-56 bg-gradient-to-br from-coral-crimson/10 to-coral-crimson/10">
 {store.banner_url && (
 <Image src={store.banner_url} alt={`${store.name} banner`} fill className="object-cover" />
 )}
 </div>

 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="relative -mt-10 mb-6 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
 <div className="h-20 w-20 overflow-hidden rounded-[90px] border-2 border-white bg-coral-crimson/5">
 {store.logo_url ? (
 <Image src={store.logo_url} alt={store.name} width={80} height={80} className="h-full w-full object-cover" />
 ) : (
 <div className="flex h-full w-full items-center justify-center bg-coral-crimson/10 text-brand-700 text-2xl font-bold">
 {store.name.charAt(0).toUpperCase()}
 </div>
 )}
 </div>

 <div className="flex-1 pt-4 sm:pt-0">
 <div className="flex flex-col sm:flex-row sm:items-center gap-2">
 <h1 className="font-display text-2xl font-bold text-coral-crimson">{store.name}</h1>
 {store.is_featured && <Badge variant="brand" size="sm">Featured</Badge>}
 </div>
 <div className="mt-1 flex items-center gap-2">
 <StarRating value={averageRating} readonly size="sm" />
 <span className="text-sm text-coral-crimson/60">(0 reviews)</span>
 </div>
 </div>
 </div>

 {store.description && (
 <p className="mb-6 max-w-2xl text-sm text-coral-crimson/70">{store.description}</p>
 )}

 <div className="mb-6 flex flex-wrap items-center gap-3">
 {store.preparation_time_minutes && (
 <div className="flex items-center gap-1.5 rounded-[90px] bg-coral-crimson/5 px-3 py-1.5 text-sm text-coral-crimson/70">
 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 ~{store.preparation_time_minutes} min prep
 </div>
 )}
 <div className="flex items-center gap-1.5 rounded-[90px] bg-green-50 px-3 py-1.5 text-sm text-green-700">
 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
 </svg>
 Pickup available
 </div>
 <div className="flex items-center gap-1.5 rounded-[90px] bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
 </svg>
 Delivery available
 </div>
 </div>

 <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-coral-crimson/10 pb-2">
 {CATEGORY_TABS.map((tab) => (
 <button
 key={tab}
 type="button"
 onClick={() => setActiveTab(tab)}
 className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
 activeTab === tab
 ? 'border-brand-600 text-brand-600'
 : 'border-transparent text-coral-crimson/60 hover:text-coral-crimson'
 }`}
 >
 {tab}
 </button>
 ))}
 </div>

 <div className="pb-12">
 <ProductGrid
 products={filteredProducts}
 loading={false}
 emptyMessage="No products in this category"
 columns={4}
 onAddToCart={addToCart}
 />
 </div>
 </div>
 </div>
 );
}

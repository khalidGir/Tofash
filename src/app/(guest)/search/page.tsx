'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cartStore';
import type { Product } from '@/types/models';
import { ProductGrid } from '@/components/features/ProductGrid';
import { SearchBar } from '@/components/features/SearchBar';
import Skeleton from '@/components/ui/Skeleton';

const MOCK_RESULTS: Product[] = [
 { id: 'p1', store_id: '1', category_id: 'c1', name: 'Chocolate Fudge Cake', slug: 'chocolate-fudge-cake', description: null, price: 450, compare_at_price: 550, images: [], is_available: true, preparation_time_minutes: 45, created_at: '2025-01-01', updated_at: '2025-01-01', store: { id: '1', seller_id: 's1', name: 'Sweet Tooth Bakery', slug: 'sweet-tooth-bakery', description: null, logo_url: null, banner_url: null, is_featured: true, is_active: true, preparation_time_minutes: 30, created_at: '', updated_at: '' } },
 { id: 'p2', store_id: '2', category_id: 'c2', name: 'Ethiopian Spiced Cookies', slug: 'ethiopian-spiced-cookies', description: null, price: 180, compare_at_price: null, images: [], is_available: true, preparation_time_minutes: 20, created_at: '2025-01-02', updated_at: '2025-01-02', store: { id: '2', seller_id: 's2', name: 'Mama T\'s Kitchen', slug: 'mama-ts-kitchen', description: null, logo_url: null, banner_url: null, is_featured: true, is_active: true, preparation_time_minutes: 45, created_at: '', updated_at: '' } },
 { id: 'p3', store_id: '3', category_id: 'c1', name: 'Strawberry Cheesecake', slug: 'strawberry-cheesecake', description: null, price: 380, compare_at_price: 420, images: [], is_available: true, preparation_time_minutes: 60, created_at: '2025-01-03', updated_at: '2025-01-03', store: { id: '3', seller_id: 's3', name: 'Cake Paradise', slug: 'cake-paradise', description: null, logo_url: null, banner_url: null, is_featured: true, is_active: true, preparation_time_minutes: 60, created_at: '', updated_at: '' } },
 { id: 'p4', store_id: '4', category_id: 'c3', name: 'Creamy Custard Pastry', slug: 'creamy-custard-pastry', description: null, price: 220, compare_at_price: null, images: [], is_available: true, preparation_time_minutes: 25, created_at: '2025-01-04', updated_at: '2025-01-04', store: { id: '4', seller_id: 's4', name: 'Cookie Jar', slug: 'cookie-jar', description: null, logo_url: null, banner_url: null, is_featured: true, is_active: true, preparation_time_minutes: 20, created_at: '', updated_at: '' } },
 { id: 'p5', store_id: '5', category_id: 'c4', name: 'Traditional Firfir Pudding', slug: 'traditional-firfir-pudding', description: null, price: 150, compare_at_price: null, images: [], is_available: false, preparation_time_minutes: 15, created_at: '2025-01-05', updated_at: '2025-01-05', store: { id: '5', seller_id: 's5', name: 'Ethio Desserts', slug: 'ethio-desserts', description: null, logo_url: null, banner_url: null, is_featured: true, is_active: true, preparation_time_minutes: 35, created_at: '', updated_at: '' } },
 { id: 'p6', store_id: '6', category_id: 'c5', name: 'Mango Ice Cream Tub', slug: 'mango-ice-cream-tub', description: null, price: 280, compare_at_price: 350, images: [], is_available: true, preparation_time_minutes: 10, created_at: '2025-01-06', updated_at: '2025-01-06', store: { id: '6', seller_id: 's6', name: 'Frost & Bake', slug: 'frost-and-bake', description: null, logo_url: null, banner_url: null, is_featured: true, is_active: true, preparation_time_minutes: 40, created_at: '', updated_at: '' } },
];

const CATEGORY_FILTERS = [
 { value: '', label: 'All' },
 { value: 'cake', label: 'Cakes' },
 { value: 'cookie', label: 'Cookies' },
 { value: 'pastry', label: 'Pastries' },
 { value: 'pudding', label: 'Puddings' },
 { value: 'ice-cream', label: 'Ice Cream' },
 { value: 'bread', label: 'Breads' },
 { value: 'drinks', label: 'Drinks' },
];

const PRICE_FILTERS = [
 { value: '', label: 'Any Price' },
 { value: '0-150', label: 'Under 150 Br' },
 { value: '150-300', label: '150-300 Br' },
 { value: '300-500', label: '300-500 Br' },
 { value: '500+ ', label: '500+ Br' },
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

function SearchContent() {
 const searchParams = useSearchParams();
 const router = useRouter();
 const query = searchParams.get('q') || '';
 const categoryFilter = searchParams.get('category') || '';
 const priceFilter = searchParams.get('price') || '';

 const [loading, setLoading] = useState(true);
 const [results, setResults] = useState<Product[]>([]);
 const [searchQuery, setSearchQuery] = useState(query);

 useEffect(() => {
 setSearchQuery(query);
 }, [query]);

 useEffect(() => {
 setLoading(true);
 const timer = setTimeout(() => {
 let filtered = [...MOCK_RESULTS];

 if (searchQuery) {
 const q = searchQuery.toLowerCase();
 filtered = filtered.filter(
 (p) =>
 p.name.toLowerCase().includes(q) ||
 p.store?.name.toLowerCase().includes(q)
 );
 }

 if (categoryFilter) {
 filtered = filtered.filter((p) => p.category?.slug === categoryFilter);
 }

 if (priceFilter) {
 filtered = filtered.filter((p) => {
 if (priceFilter === '0-150') return p.price < 150;
 if (priceFilter === '150-300') return p.price >= 150 && p.price < 300;
 if (priceFilter === '300-500') return p.price >= 300 && p.price < 500;
 if (priceFilter === '500+ ') return p.price >= 500;
 return true;
 });
 }

 setResults(filtered);
 setLoading(false);
 }, 400);

 return () => clearTimeout(timer);
 }, [searchQuery, categoryFilter, priceFilter]);

 const updateFilter = useCallback(
 (key: string, value: string) => {
 const params = new URLSearchParams(searchParams.toString());
 if (value) {
 params.set(key, value);
 } else {
 params.delete(key);
 }
 if (key === 'q' && !value) params.delete('q');
 router.push(`/search?${params.toString()}`, { scroll: false });
 },
 [searchParams, router]
 );

 const handleSearch = useCallback(
 (q: string) => {
 updateFilter('q', q);
 },
 [updateFilter]
 );

 return (
 <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
 <div className="mb-6">
 <SearchBar
 initialValue={searchQuery}
 onSearch={handleSearch}
 placeholder="Search desserts, sellers..."
 navigateOnSubmit={false}
 className="max-w-xl"
 />
 </div>

 <div className="mb-6 flex flex-wrap items-center gap-2">
 <span className="text-sm font-medium text-coral-crimson mr-1">Category:</span>
 {CATEGORY_FILTERS.map((f) => (
 <button
 key={f.value}
 type="button"
 onClick={() => updateFilter('category', f.value)}
 className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
 categoryFilter === f.value
 ? 'bg-brand-600 text-white'
 : 'bg-coral-crimson/5 text-coral-crimson/70 hover:bg-coral-crimson/10'
 }`}
 >
 {f.label}
 </button>
 ))}
 </div>

 <div className="mb-8 flex flex-wrap items-center gap-2">
 <span className="text-sm font-medium text-coral-crimson mr-1">Price:</span>
 {PRICE_FILTERS.map((f) => (
 <button
 key={f.value}
 type="button"
 onClick={() => updateFilter('price', f.value)}
 className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
 priceFilter === f.value
 ? 'bg-brand-600 text-white'
 : 'bg-coral-crimson/5 text-coral-crimson/70 hover:bg-coral-crimson/10'
 }`}
 >
 {f.label}
 </button>
 ))}
 </div>

 <ProductGrid
 products={results}
 loading={loading}
 emptyMessage={searchQuery ?`No results for"${searchQuery}"` : 'No products found'}
 emptyDescription="Try adjusting your filters or search terms"
 columns={4}
 onAddToCart={addToCart}
 />
 </div>
 );
}

export default function SearchPage() {
 return (
 <Suspense fallback={
 <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
 <Skeleton variant="rectangular" className="h-12 w-full max-w-xl rounded-full mb-6" />
 <div className="flex gap-2 mb-6">
 {Array.from({ length: 5 }).map((_, i) => (
 <Skeleton key={i} variant="rectangular" className="h-8 w-20 rounded-full" />
 ))}
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
 {Array.from({ length: 8 }).map((_, i) => (
 <div key={i} className="rounded-[90px] bg-pure-white p-4">
 <Skeleton variant="rectangular" className="aspect-square w-full rounded-[90px] mb-3" />
 <Skeleton variant="text" className="h-4 w-3/4 mb-2" />
 <Skeleton variant="text" className="h-3 w-1/2 mb-2" />
 <Skeleton variant="text" className="h-5 w-16" />
 </div>
 ))}
 </div>
 </div>
 }>
 <SearchContent />
 </Suspense>
 );
}

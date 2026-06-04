'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/layout/AuthGuard';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
 {
 label: 'Orders',
 href: '/customer/orders',
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
 </svg>
 ),
 },
 {
 label: 'Favorites',
 href: '/customer/favorites',
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 ),
 },
 {
 label: 'Cart',
 href: '/customer/cart',
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
 </svg>
 ),
 badge: 'cart',
 },
 {
 label: 'Chat',
 href: '/customer/chat',
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
 </svg>
 ),
 },
];

function CustomerNav() {
 const pathname = usePathname();
 const router = useRouter();
 const { items, getItemCount } = useCartStore();
 const cartCount = getItemCount();

 return (
 <>
 {/* Desktop sidebar */}
 <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-coral-crimson/10 lg:bg-pure-white">
 <div className="flex h-16 items-center gap-2 border-b border-coral-crimson/10 px-6">
 <Link href="/" className="font-display text-xl font-bold text-brand-600">
 Tofash
 </Link>
 </div>
 <nav className="flex-1 space-y-1 p-4">
 {NAV_ITEMS.map((item) => {
 const isActive = pathname.startsWith(item.href);
 return (
 <button
 key={item.href}
 onClick={() => router.push(item.href)}
 className={cn(
'flex w-full items-center gap-3 rounded-[90px] px-4 py-2.5 text-sm font-medium transition-colors',
 isActive
 ? 'bg-coral-crimson/5 text-brand-700'
 : 'text-coral-crimson/70 hover:bg-coral-crimson/5 hover:text-coral-crimson'
 )}
 >
 {item.icon}
 <span>{item.label}</span>
 {item.badge === 'cart' && cartCount > 0 && (
 <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
 {cartCount > 9 ? '9+ ' : cartCount}
 </span>
 )}
 </button>
 );
 })}
 </nav>
 </aside>

 {/* Mobile bottom nav */}
 <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-coral-crimson/10 bg-pure-white lg:hidden">
 <div className="flex items-center justify-around px-2 py-1">
 {NAV_ITEMS.map((item) => {
 const isActive = pathname.startsWith(item.href);
 return (
 <button
 key={item.href}
 onClick={() => router.push(item.href)}
 className={cn(
'relative flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors',
 isActive ? 'text-brand-600' : 'text-coral-crimson/50'
 )}
 >
 {item.icon}
 <span>{item.label}</span>
 {item.badge === 'cart' && cartCount > 0 && (
 <span className="absolute -top-0.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[8px] font-bold text-white">
 {cartCount > 9 ? '9+ ' : cartCount}
 </span>
 )}
 </button>
 );
 })}
 </div>
 </nav>
 </>
 );
}

export default function CustomerLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const { profile } = useAuthStore();

 return (
 <AuthGuard role="customer">
 <div className="min-h-screen bg-cream">
 <CustomerNav />

 {/* Main content area */}
 <div className="lg:pl-64">
 {/* Header */}
 <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-4 border-b border-coral-crimson/10 bg-white/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
 {profile && (
 <div className="flex items-center gap-3">
 <div className="text-right">
 <p className="text-sm font-medium text-coral-crimson">
 {profile.full_name || 'Customer'}
 </p>
 <p className="text-xs text-coral-crimson/60">Customer</p>
 </div>
 <Avatar
 src={profile.avatar_url}
 fallback={profile.full_name || 'C'}
 size="md"
 />
 </div>
 )}
 </header>

 {/* Page content */}
 <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-6">
 {children}
 </main>
 </div>
 </div>
 </AuthGuard>
 );
}

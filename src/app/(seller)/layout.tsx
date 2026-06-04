'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import AuthGuard from '@/components/layout/AuthGuard';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { ROUTES } from '@/lib/utils/constants';

interface NavItem {
 label: string;
 href: string;
 icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
 {
 label: 'Dashboard',
 href: ROUTES.SELLER.DASHBOARD,
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
 </svg>
 ),
 },
 {
 label: 'Orders',
 href: ROUTES.SELLER.ORDERS,
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
 </svg>
 ),
 },
 {
 label: 'Products',
 href: ROUTES.SELLER.PRODUCTS,
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
 </svg>
 ),
 },
 {
 label: 'Settings',
 href: ROUTES.SELLER.SETTINGS,
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 ),
 },
 {
 label: 'Chat Inbox',
 href: ROUTES.SELLER.CHAT,
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
 </svg>
 ),
 },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const { profile } = useAuthStore();
 const [sidebarOpen, setSidebarOpen] = useState(false);

 return (
 <AuthGuard role="seller">
 <div className="flex min-h-screen bg-blush-paper">
 {/* Mobile overlay */}
 {sidebarOpen && (
 <div
 className="fixed inset-0 z-40 bg-black/50 lg:hidden"
 onClick={() => setSidebarOpen(false)}
 />
 )}

 {/* Sidebar */}
 <aside
 className={cn(
'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-pure-white border-r border-coral-crimson/20 transition-transform lg:relative lg:translate-x-0',
 sidebarOpen ? 'translate-x-0' : '-translate-x-full'
 )}
 >
 <div className="flex h-16 items-center gap-2 px-6 border-b border-coral-crimson/10">
 <span className="text-xl font-bold text-brand-600">Tofash</span>
 <span className="text-xs text-coral-crimson/50">Seller</span>
 </div>

 <nav className="flex-1 space-y-1 p-4">
 {NAV_ITEMS.map((item) => {
 const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
 return (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setSidebarOpen(false)}
 className={cn(
'flex items-center gap-3 rounded-[90px] px-3 py-2.5 text-sm font-medium transition-colors',
 isActive
 ? 'bg-coral-crimson/5 text-brand-700'
 : 'text-coral-crimson/70 hover:bg-coral-crimson/5 hover:text-coral-crimson'
 )}
 >
 {item.icon}
 {item.label}
 </Link>
 );
 })}
 </nav>

 <div className="border-t border-coral-crimson/10 p-4">
 <div className="flex items-center gap-3">
 <Avatar src={profile?.avatar_url} fallback={profile?.full_name ?? 'S'} size="sm" />
 <div className="min-w-0">
 <p className="text-sm font-medium text-coral-crimson truncate">{profile?.full_name ?? 'Seller'}</p>
 <p className="text-xs text-coral-crimson/60 truncate">{profile?.phone}</p>
 </div>
 </div>
 </div>
 </aside>

 {/* Main area */}
 <div className="flex flex-1 flex-col min-w-0">
 {/* Top bar */}
 <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-coral-crimson/20 bg-pure-white px-4 sm:px-6">
 <button
 onClick={() => setSidebarOpen(true)}
 className="lg:hidden rounded-[90px] p-2 text-coral-crimson/60 hover:bg-coral-crimson/10 transition-colors"
 aria-label="Open sidebar"
 >
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
 </svg>
 </button>

 <div className="flex-1" />

 <button className="relative rounded-[90px] p-2 text-coral-crimson/60 hover:bg-coral-crimson/10 transition-colors" aria-label="Notifications">
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
 </svg>
 <Badge variant="red" size="sm" className="absolute -top-1 -right-1 px-1">3</Badge>
 </button>

 <Link href={ROUTES.SELLER.SETTINGS}>
 <Avatar src={profile?.avatar_url} fallback={profile?.full_name ?? 'S'} size="sm" />
 </Link>
 </header>

 {/* Page content */}
 <main className="flex-1 p-4 sm:p-6 lg:p-8">
 {children}
 </main>

 {/* Mobile bottom nav */}
 <nav className="sticky bottom-0 z-30 flex items-center justify-around border-t border-coral-crimson/20 bg-pure-white px-2 py-2 lg:hidden">
 {NAV_ITEMS.slice(0, 5).map((item) => {
 const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
 return (
 <Link
 key={item.href}
 href={item.href}
 className={cn(
'flex flex-col items-center gap-0.5 px-3 py-1 rounded-[90px] text-xs font-medium transition-colors',
 isActive ? 'text-brand-600' : 'text-coral-crimson/60 hover:text-coral-crimson'
 )}
 >
 {item.icon}
 <span>{item.label}</span>
 </Link>
 );
 })}
 </nav>
 </div>
 </div>
 </AuthGuard>
 );
}

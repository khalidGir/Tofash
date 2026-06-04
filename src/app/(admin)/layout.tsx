'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import AuthGuard from '@/components/layout/AuthGuard';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils/cn';
import { ROUTES } from '@/lib/utils/constants';

interface NavItem {
 label: string;
 href: string;
 icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
 {
 label: 'Sellers',
 href: ROUTES.ADMIN.SELLERS,
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
 </svg>
 ),
 },
 {
 label: 'Products',
 href: ROUTES.ADMIN.PRODUCTS,
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
 </svg>
 ),
 },
 {
 label: 'Orders',
 href: ROUTES.ADMIN.ORDERS,
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
 </svg>
 ),
 },
 {
 label: 'Disputes',
 href: ROUTES.ADMIN.DISPUTES,
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
 </svg>
 ),
 },
 {
 label: 'Analytics',
 href: ROUTES.ADMIN.ANALYTICS,
 icon: (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
 </svg>
 ),
 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const { profile } = useAuthStore();
 const [sidebarOpen, setSidebarOpen] = useState(false);

 return (
 <AuthGuard role="admin">
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
 <span className="text-xs text-coral-crimson/50">Admin</span>
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
 <Avatar src={profile?.avatar_url} fallback={profile?.full_name ?? 'A'} size="sm" />
 <div className="min-w-0">
 <p className="text-sm font-medium text-coral-crimson truncate">{profile?.full_name ?? 'Admin'}</p>
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

 <div className="flex items-center gap-2 px-3 py-1.5 rounded-[90px] bg-coral-crimson/5 text-brand-700 text-sm font-medium">
 <span className="h-2 w-2 rounded-full bg-green-500" />
 Admin
 </div>
 </header>

 {/* Page content */}
 <main className="flex-1 p-4 sm:p-6 lg:p-8">
 {children}
 </main>
 </div>
 </div>
 </AuthGuard>
 );
}

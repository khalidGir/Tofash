'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cartStore';
import { cn } from '@/lib/utils/cn';

const navItems = [
 {
 label: 'Home',
 href: '/',
 icon: (
 <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
 </svg>
 ),
 },
 {
 label: 'Search',
 href: '/search',
 icon: (
 <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 ),
 },
 {
 label: 'Cart',
 href: '/cart',
 icon: (
 <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
 </svg>
 ),
 },
 {
 label: 'Account',
 href: '/login',
 icon: (
 <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
 </svg>
 ),
 },
];

export default function MobileNav() {
 const pathname = usePathname();
 const itemCount = useCartStore((s) => s.getItemCount());

 return (
 <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-coral-crimson/10 bg-pure-white md:hidden">
 <div className="flex items-center justify-around">
 {navItems.map((item) => {
 const isActive = item.href === '/'
 ? pathname === '/'
 : pathname.startsWith(item.href);
 const isCart = item.href === '/cart';

 return (
 <Link
 key={item.href}
 href={item.href}
 className={cn(
'relative flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-medium transition-colors',
 isActive ? 'text-brand-600' : 'text-coral-crimson/60 hover:text-coral-crimson'
 )}
 >
 {isCart && itemCount > 0 ? (
 <span className="relative">
 {item.icon}
 <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-bold leading-none text-white">
 {itemCount > 99 ? '99+ ' : itemCount}
 </span>
 </span>
 ) : (
 item.icon
 )}
 <span>{item.label}</span>
 </Link>
 );
 })}
 </div>
 </nav>
 );
}

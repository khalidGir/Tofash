'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { cn } from '@/lib/utils/cn';
import { ROUTES } from '@/lib/utils/constants';
import { SearchBar } from '@/components/features/SearchBar';
import Avatar from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export default function Header() {
 const pathname = usePathname();
 const router = useRouter();
 const itemCount = useCartStore((s) => s.getItemCount());
 const { session, profile } = useAuthStore();
 const [langOpen, setLangOpen] = useState(false);
 const [profileOpen, setProfileOpen] = useState(false);

 const currentLocale = pathname.startsWith('/am') ? 'am' : 'en';

 const switchLocale = (locale: string) => {
 const newPath = locale === 'en' ? pathname.replace(/^\/am/, '') || '/' :`/am${pathname}`;
 router.push(newPath);
 setLangOpen(false);
 };

 return (
 <header className="sticky top-0 z-50 border-b border-coral-crimson/10 bg-white/95 backdrop-blur-md">
 <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
 <Link href="/" className="flex shrink-0 items-center gap-2">
 <span className="font-display text-xl font-bold text-brand-600">Tofash</span>
 </Link>

 <div className="hidden flex-1 md:block max-w-md lg:max-w-lg">
 <SearchBar />
 </div>

 <div className="flex items-center gap-1 sm:gap-2">
 <div className="relative">
 <button
 type="button"
 onClick={() => setLangOpen(!langOpen)}
 className="flex items-center gap-1 rounded-[90px] px-2.5 py-2 text-sm font-medium text-coral-crimson/70 hover:bg-coral-crimson/10 transition-colors"
 aria-label="Toggle language"
 >
 {currentLocale === 'en' ? 'EN' : 'አማ'}
 <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
 </svg>
 </button>
 {langOpen && (
 <>
 <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
 <div className="absolute right-0 z-20 mt-1 w-28 rounded-[90px] border border-coral-crimson/20 bg-pure-white py-1">
 <button
 type="button"
 onClick={() => switchLocale('en')}
 className={cn('w-full px-3 py-1.5 text-left text-sm hover:bg-coral-crimson/5', currentLocale === 'en' ? 'font-semibold text-brand-600' : 'text-coral-crimson')}
 >
 English
 </button>
 <button
 type="button"
 onClick={() => switchLocale('am')}
 className={cn('w-full px-3 py-1.5 text-left text-sm hover:bg-coral-crimson/5', currentLocale === 'am' ? 'font-semibold text-brand-600' : 'text-coral-crimson')}
 >
 አማርኛ
 </button>
 </div>
 </>
 )}
 </div>

 {session && (
 <Link
 href={ROUTES.CUSTOMER.FAVORITES}
 className="relative flex h-10 w-10 items-center justify-center rounded-[90px] text-coral-crimson/70 hover:bg-coral-crimson/10 transition-colors"
 aria-label="Favorites"
 >
 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
 </svg>
 </Link>
 )}

 <Link
 href={ROUTES.CART}
 className="relative flex h-10 w-10 items-center justify-center rounded-[90px] text-coral-crimson/70 hover:bg-coral-crimson/10 transition-colors"
 aria-label="Cart"
 >
 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
 </svg>
 {itemCount > 0 && (
 <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-none text-white">
 {itemCount > 99 ? '99+ ' : itemCount}
 </span>
 )}
 </Link>

 {session && profile ? (
 <div className="relative">
 <button
 type="button"
 onClick={() => setProfileOpen(!profileOpen)}
 className="flex items-center gap-2 rounded-[90px] p-1 hover:bg-coral-crimson/10 transition-colors"
 >
 <Avatar src={profile.avatar_url} alt={profile.full_name || ''} size="sm" fallback={profile.full_name || 'U'} />
 </button>
 {profileOpen && (
 <>
 <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
 <div className="absolute right-0 z-20 mt-1 w-48 rounded-[90px] border border-coral-crimson/20 bg-pure-white py-1">
 <div className="border-b border-coral-crimson/10 px-3 py-2">
 <p className="text-sm font-medium text-coral-crimson">{profile.full_name || 'User'}</p>
 <p className="text-xs text-coral-crimson/60">{profile.phone}</p>
 </div>
 <Link href={ROUTES.CUSTOMER.ORDERS} className="block px-3 py-1.5 text-sm text-coral-crimson hover:bg-coral-crimson/5" onClick={() => setProfileOpen(false)}>My Orders</Link>
 <Link href={ROUTES.CUSTOMER.FAVORITES} className="block px-3 py-1.5 text-sm text-coral-crimson hover:bg-coral-crimson/5" onClick={() => setProfileOpen(false)}>Favorites</Link>
 <button
 type="button"
 onClick={() => { useAuthStore.getState().clearAuth(); setProfileOpen(false); }}
 className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-coral-crimson/5"
 >
 Sign Out
 </button>
 </div>
 </>
 )}
 </div>
 ) : (
 <Link href={ROUTES.LOGIN}>
 <Button variant="primary" size="sm">
 Sign In
 </Button>
 </Link>
 )}
 </div>
 </div>
 </header>
 );
}

'use client';

import { useEffect, type ReactNode } from 'react';
import { useCartStore } from '@/lib/stores/cartStore';

export function CartProvider({ children }: { children: ReactNode }) {
 const items = useCartStore((s) => s.items);

 useEffect(() => {
 const handleStorageChange = (e: StorageEvent) => {
 if (e.key === 'tofash-cart') {
 useCartStore.persist.rehydrate();
 }
 };
 window.addEventListener('storage', handleStorageChange);
 return () => window.removeEventListener('storage', handleStorageChange);
 }, []);

 return <>{children}</>;
}

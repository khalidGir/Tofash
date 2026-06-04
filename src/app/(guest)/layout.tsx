'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';

export default function GuestLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <div className="flex min-h-screen flex-col">
 <Header />
 <main className="flex-1">{children}</main>
 <Footer />
 <MobileNav />
 </div>
 );
}

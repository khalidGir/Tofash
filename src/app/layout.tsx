import type { Metadata, Viewport } from 'next';
import { Nunito_Sans, Noto_Sans_Ethiopic, Sansita } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import './globals.css';

const nunitoSans = Nunito_Sans({
 variable: '--font-nunito-sans',
 subsets: ['latin'],
 weight: ['400', '700'],
 display: 'swap',
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
 variable: '--font-noto-sans-ethiopic',
 subsets: ['latin', 'ethiopic'],
 display: 'swap',
});

const sansita = Sansita({
 variable: '--font-sansita',
 subsets: ['latin'],
 weight: ['700'],
 display: 'swap',
});

export const metadata: Metadata = {
 title: {
 default: 'Tofash — Homemade Desserts',
 template: '%s | Tofash',
 },
 description:
 'Discover homemade desserts from trusted sellers in Addis Ababa',
 manifest: '/manifest.json',
 appleWebApp: {
 capable: true,
 statusBarStyle: 'default',
 title: 'Tofash',
 },
 formatDetection: {
 telephone: true,
 },
 icons: {
 icon: '/icons/icon-192.png',
 apple: '/icons/icon-192.png',
 },
};

export const viewport: Viewport = {
 themeColor: '#db404f',
 width: 'device-width',
 initialScale: 1,
 maximumScale: 1,
 userScalable: false,
};

export default async function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 const locale = await getLocale();
 const messages = await getMessages();

 return (
 <html
 lang={locale}
 className={`${nunitoSans.variable} ${notoSansEthiopic.variable} ${sansita.variable} h-full antialiased`}
 >
 <head>
 <link rel="apple-touch-icon" href="/icons/icon-192.png" />
 <meta name="apple-mobile-web-app-capable" content="yes" />
 </head>
 <body className="min-h-full flex flex-col bg-blush-paper text-coral-crimson">
 <NextIntlClientProvider messages={messages}>
 <QueryProvider>
 <AuthProvider>
 <CartProvider>{children}</CartProvider>
 </AuthProvider>
 </QueryProvider>
 </NextIntlClientProvider>
 </body>
 </html>
 );
}

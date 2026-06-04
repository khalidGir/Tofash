'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Footer() {
 const pathname = usePathname();
 const router = useRouter();

 const currentLocale = pathname.startsWith('/am') ? 'am' : 'en';

 const switchLocale = (locale: string) => {
 const newPath = locale === 'en' ? pathname.replace(/^\/am/, '') || '/' :`/am${pathname}`;
 router.push(newPath);
 };

 return (
 <footer className="mt-auto border-t border-coral-crimson/10 bg-pure-white">
 <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
 <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
 <div className="text-center sm:text-left">
 <Link href="/" className="font-display text-lg font-bold text-brand-600">
 Tofash
 </Link>
 <p className="mt-1 text-sm text-coral-crimson/60">
 Discover homemade desserts from trusted sellers in Addis Ababa.
 </p>
 </div>

 <div className="flex items-center gap-4">
 <div className="flex gap-3">
 <a
 href="https://facebook.com/tofash"
 target="_blank"
 rel="noopener noreferrer"
 className="text-coral-crimson/50 hover:text-brand-600 transition-colors"
 aria-label="Facebook"
 >
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
 </svg>
 </a>
 <a
 href="https://instagram.com/tofash"
 target="_blank"
 rel="noopener noreferrer"
 className="text-coral-crimson/50 hover:text-brand-600 transition-colors"
 aria-label="Instagram"
 >
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.11 2.525c.636-.247 1.363-.416 2.427-.465C8.83 2.013 9.184 2 11.615 2h.7zm-.08 1.802h-.47c-2.406 0-2.688.009-3.637.052-1.054.048-1.626.22-2.007.366-.502.193-.86.424-1.235.8-.376.376-.607.733-.8 1.235-.146.38-.318.953-.366 2.007-.043.949-.052 1.231-.052 3.638v.47c0 2.407.009 2.689.052 3.638.048 1.054.22 1.626.366 2.007.193.502.424.86.8 1.235.376.376.733.607 1.235.8.38.146.953.318 2.007.366.949.043 1.231.052 3.638.052h.47c2.407 0 2.689-.009 3.638-.052 1.054-.048 1.626-.22 2.007-.366.502-.193.86-.424 1.235-.8.376-.376.607-.733.8-1.235.146-.38.318-.953.366-2.007.043-.949.052-1.231.052-3.638v-.47c0-2.407-.009-2.689-.052-3.638-.048-1.054-.22-1.626-.366-2.007-.193-.502-.424-.86-.8-1.235-.376-.376-.733-.607-1.235-.8-.38-.146-.953-.318-2.007-.366-.949-.043-1.231-.052-3.638-.052zm0 4.911a3.792 3.792 0 013.787 3.787 3.792 3.792 0 01-3.787 3.787 3.792 3.792 0 01-3.787-3.787 3.792 3.792 0 013.787-3.787zm0 1.802a1.985 1.985 0 100 3.97 1.985 1.985 0 000-3.97zm3.893-2.802a.892.892 0 100 1.784.892.892 0 000-1.784z" />
 </svg>
 </a>
 <a
 href="https://t.me/tofash"
 target="_blank"
 rel="noopener noreferrer"
 className="text-coral-crimson/50 hover:text-brand-600 transition-colors"
 aria-label="Telegram"
 >
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
 </svg>
 </a>
 </div>

 <div className="flex items-center gap-1 border-l border-coral-crimson/20 pl-4">
 <button
 type="button"
 onClick={() => switchLocale('en')}
 className={`px-2 py-1 text-sm font-medium rounded-[90px] transition-colors ${currentLocale === 'en' ? 'bg-coral-crimson/5 text-brand-600' : 'text-coral-crimson/60 hover:text-coral-crimson'}`}
 >
 EN
 </button>
 <button
 type="button"
 onClick={() => switchLocale('am')}
 className={`px-2 py-1 text-sm font-medium rounded-[90px] transition-colors ${currentLocale === 'am' ? 'bg-coral-crimson/5 text-brand-600' : 'text-coral-crimson/60 hover:text-coral-crimson'}`}
 >
 አማ
 </button>
 </div>
 </div>
 </div>

 <div className="mt-6 border-t border-coral-crimson/10 pt-4 text-center text-xs text-coral-crimson/50">
 &copy; {new Date().getFullYear()} Tofash. All rights reserved.
 </div>
 </div>
 </footer>
 );
}

'use client';

import Link from 'next/link';
import { LayoutDashboard, Stethoscope } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DemoSwitcher() {
  const pathname = usePathname();
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    const sync = () => setLanguage(document.documentElement.lang === 'en' ? 'en' : 'ar');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    return () => observer.disconnect();
  }, []);

  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true' || /\/admin\/visits\/[^/]+\/print$/.test(pathname)) return null;

  const admin = pathname.startsWith('/admin');
  return (
    <nav
      aria-label={language === 'ar' ? 'التبديل بين واجهات العرض التجريبي' : 'Switch demo experience'}
      className="demo-switcher no-print fixed bottom-[calc(5.85rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[80] flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200/80 bg-white/95 p-1 shadow-xl backdrop-blur-xl lg:bottom-5"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <Link href="/" aria-current={!admin ? 'page' : undefined} className={`flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${!admin ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
        <Stethoscope size={15} aria-hidden />
        <span className="hidden sm:inline">{language === 'ar' ? 'تجربة المريض' : 'Patient Experience'}</span>
        <span className="sm:hidden">{language === 'ar' ? 'المريض' : 'Patient'}</span>
      </Link>
      <Link href="/admin" aria-current={admin ? 'page' : undefined} className={`flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${admin ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
        <LayoutDashboard size={15} aria-hidden />
        <span className="hidden sm:inline">{language === 'ar' ? 'لوحة العيادة' : 'Clinic Dashboard'}</span>
        <span className="sm:hidden">{language === 'ar' ? 'الإدارة' : 'Admin'}</span>
      </Link>
    </nav>
  );
}

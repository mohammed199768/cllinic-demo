'use client';

import { usePathname } from 'next/navigation';
import { LanguageProvider } from '@/lib/i18n';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';
import MedicalContentDock from '@/components/MedicalContentDock';
import HereAssistantWidget from '@/components/HereAssistantWidget';
import JsonLd from '@/components/JsonLd';
import PWAProvider from '@/components/pwa/PWAProvider';
import MobileAppDock from '@/components/navigation/MobileAppDock';
import DemoSwitcher from '@/components/DemoSwitcher';

export default function AppExperience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <>
        {children}
        <DemoSwitcher />
      </>
    );
  }

  return (
    <div className="public-app min-h-screen">
      <JsonLd />
      <LanguageProvider>
        <PWAProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:shadow-soft"
          >
            تخطَّ إلى المحتوى / Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="pt-16 lg:pt-0">{children}</main>
          <SiteFooter />
          <WhatsAppFloatingButton />
          <MedicalContentDock />
          <HereAssistantWidget />
          <MobileAppDock />
          <DemoSwitcher />
        </PWAProvider>
      </LanguageProvider>
    </div>
  );
}

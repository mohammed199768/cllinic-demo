import type { Metadata } from 'next';
import './admin.css';
import { LocaleProvider } from '@/admin/i18n/LocaleProvider';
import { ToastProvider } from '@/admin/components/Toast';
import { CLINIC } from '@/admin/config/clinic';

export const metadata: Metadata = {
  title: `${CLINIC.nameEn} Management | ${CLINIC.nameAr}`,
  description: 'Demo-only bilingual clinic operations and patient workflow management.',
  applicationName: CLINIC.nameEn,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-app min-h-screen">
      <LocaleProvider>
        <ToastProvider>{children}</ToastProvider>
      </LocaleProvider>
    </div>
  );
}

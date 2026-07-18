'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasDemoSession } from '@ourclinic/local-data/admin-adapter';

export default function AdminEntryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(hasDemoSession() ? '/admin/today' : '/admin/login');
  }, [router]);

  return (
    <div className="grid min-h-screen place-items-center bg-surface-canvas" role="status" aria-live="polite">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" aria-label="Loading" />
    </div>
  );
}

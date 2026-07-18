import { Shell } from '@/admin/components/Shell';
import { CommandPalette } from '@/admin/components/CommandPalette';
import { Shortcuts } from '@/admin/components/Shortcuts';
import { DemoAuthProvider } from '@/admin/auth/AuthProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoAuthProvider>
      <div>
        <Shell>{children}</Shell>
        <CommandPalette />
        <Shortcuts />
      </div>
    </DemoAuthProvider>
  );
}

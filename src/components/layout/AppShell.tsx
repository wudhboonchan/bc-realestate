'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { Footer } from '@/components/layout/Footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Public tenant-facing routes should not display the admin sidebar or top header
  const isPublicTenantPage =
    pathname.startsWith('/liff') ||
    pathname.startsWith('/invoice/') ||
    pathname === '/invoice';

  if (isPublicTenantPage) {
    return <div className="min-h-screen bg-[#FAF7F2]">{children}</div>;
  }

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

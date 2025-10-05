'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { TopNavbar } from '@/components/top-navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname.startsWith('/auth');
  if (isPublicPage) return <>{children}</>;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 min-w-0 overflow-hidden p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

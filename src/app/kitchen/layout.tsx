'use client';

import { Logo } from '@/components/Logo';
import Link from 'next/link';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div>
          <Link href="/kitchen">
            <Logo className="text-foreground" />
          </Link>
        </div>
      </header>
      <main className="flex-1 bg-muted/30 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
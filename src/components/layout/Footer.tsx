
'use client';

import { Instagram } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Footer() {
  const pathname = usePathname();
  const [year, setYear] = useState(2025); // Default year

  // Set year after hydration to avoid mismatch
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (pathname.startsWith('/staff') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-card text-card-foreground shadow-inner">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row md:px-6">
        <p className="text-sm text-muted-foreground">
          © {year} Chonieur Food &amp; Helado. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="https://www.instagram.com/chouieur_food" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Instagram className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

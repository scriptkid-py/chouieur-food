'use client';

import Link from 'next/link';
import { Menu as MenuIcon, ShoppingCart, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useCart } from '@/context/CartContext';
import { useIsMobile } from '@/hooks/use-mobile';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { itemCount } = useCart();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  // Track hydration to avoid showing cart count mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (pathname.startsWith('/staff') || pathname.startsWith('/admin')) {
    return null;
  }
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 bg-background/80 shadow-md backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-2xl font-bold" onClick={() => isMenuOpen && setIsMenuOpen(false)}>
            <Logo className="text-foreground" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-base font-medium text-foreground/80 transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
           <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {isHydrated && itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
                <span className="sr-only">View Cart</span>
              </Link>
            </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
      </div>

      {isMobile && isMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-background shadow-lg md:hidden">
            <nav className="flex flex-col items-center gap-4 p-6">
                {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={toggleMenu} className="text-lg font-medium text-foreground/80 transition-colors hover:text-primary">
                    {link.label}
                    </Link>
                ))}
            </nav>
        </div>
      )}
    </header>
  );
}

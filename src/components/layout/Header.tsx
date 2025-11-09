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
    <header className="sticky top-0 z-50 bg-black shadow-md">
      <div className="container mx-auto flex h-20 sm:h-24 items-center justify-between px-3 sm:px-4 md:px-6">
        <Link 
          href="/" 
          className="flex-shrink-0 z-50 flex items-center gap-3 flex-col sm:flex-row justify-center sm:justify-start" 
          onClick={() => isMenuOpen && setIsMenuOpen(false)}
        >
          <Logo className="h-[80px] w-auto" />
          <h1 className="text-white text-xl sm:text-2xl font-bold font-sans">Chonieur Food & Helado</h1>
        </Link>

        <nav className="hidden items-center gap-4 lg:gap-6 md:flex">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-sm lg:text-base font-medium text-white transition-colors hover:text-gray-300 px-2 py-1 rounded-md hover:bg-gray-800"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
           <Button asChild variant="ghost" size="icon" className="relative h-10 w-10 sm:h-11 sm:w-11 touch-manipulation text-white hover:bg-gray-800">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                {isHydrated && itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
                <span className="sr-only">View Cart</span>
              </Link>
            </Button>
          <Button variant="ghost" size="icon" className="md:hidden h-10 w-10 touch-manipulation text-white hover:bg-gray-800" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
      </div>

      {isMobile && isMenuOpen && (
        <div className="absolute top-20 sm:top-24 left-0 w-full bg-black shadow-lg md:hidden border-t border-gray-800">
            <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      onClick={toggleMenu} 
                      className="text-base font-medium text-white transition-colors hover:text-gray-300 px-4 py-3 rounded-md hover:bg-gray-800 touch-manipulation"
                    >
                    {link.label}
                    </Link>
                ))}
            </nav>
        </div>
      )}
    </header>
  );
}

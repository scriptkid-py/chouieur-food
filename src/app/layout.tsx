import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/CartContext';
import { FirebaseClientProvider } from '@/firebase';
import { StaffAuthProvider } from '@/context/StaffAuthContext';
import { UserSync } from '@/components/UserSync';

export const metadata: Metadata = {
  title: 'Chouieur Express',
  description: 'Order delicious fast food from Chouieur Food & Helado',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <StaffAuthProvider>
            <CartProvider>
              <UserSync />
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </CartProvider>
          </StaffAuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

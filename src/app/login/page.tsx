'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuthProvider, signInWithPopup, OAuthProvider, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const GoogleIcon = () => (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const AppleIcon = () => (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.226 2.002a2.352 2.352 0 0 0-1.884.873c-.563.83-1.043 2.158-.93 3.498.123 1.488.94 2.512 1.903 2.512.973 0 1.543-.787 2.45-2.03-1.01-.632-1.41-2.484-1.54-4.853zm-2.802 4.34C11.16 4.69 9.38 3.55 7.62 3.55c-2.4 0-4.015 1.54-4.015 4.318 0 2.924 1.765 4.63 3.73 4.63 1.06 0 2.02-.456 2.825-1.127-.128-.052-2.22-1.02-2.22-3.122 0-1.748 1.435-2.52 2.29-3.08zM13.6 10.33c-.64.39-1.28.8-1.28 1.9 0 1.7.9 2.5 1.8 2.5s1.2-.8 2-1.9c-.2-.1-1.4-.7-2.5-2.5zM12.015 23C13.2 23 14.85 22.14 16.05 21.31c1.2-.84 2-1.97 2.2-2.07-.1-.04-2.25-1.43-2.25-3.95s1.9-3.7 2.1-3.8c-1.1-1.8-3.1-2.2-3.8-2.2-.8 0-1.5.3-2.1.7-.8.5-1.5 1.3-1.9 2.1-.5.8-.9 1.8-.9 2.7 0 2 .8 3.9 1.7 4.8 0 .1.1.1.1.2z"/>
    </svg>
);


export default function LoginPage() {
  const [isSocialLoading, setIsSocialLoading] = useState<null | 'google' | 'apple'>(null);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();


  const handleSocialLogin = async (providerName: 'google' | 'apple') => {
    if (!auth) return;
    setIsSocialLoading(providerName);
    try {
      let provider;
      if (providerName === 'google') {
        provider = new GoogleAuthProvider();
      } else {
        provider = new OAuthProvider('apple.com');
      }

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      await createCustomerUserIfNotExists(user);

      toast({ title: 'Login Successful' });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSocialLoading(null);
    }
  };

  const createCustomerUserIfNotExists = async (user: User) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        role: 'customer',
      });
    }
  };

  return (
    <>
      <Header />
      <main className="flex-grow">
        <div className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Customer Login</CardTitle>
              <CardDescription>Use your Google or Apple account to continue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                     <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={!!isSocialLoading}>
                        {isSocialLoading === 'google' ? 'Loading...' : <><GoogleIcon /> Continue with Google</>}
                    </Button>
                    <Button variant="outline" onClick={() => handleSocialLogin('apple')} disabled={!!isSocialLoading}>
                       {isSocialLoading === 'apple' ? 'Loading...' : <><AppleIcon /> Continue with Apple</>}
                    </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}

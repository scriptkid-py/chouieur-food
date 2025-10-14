'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function SignupPage() {
  return (
    <>
    <Header />
    <main className="flex-grow">
      <div className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
            <CardDescription>Create your customer account.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Please use one of the social login options on the login page to create an account.</p>
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
    <Footer />
    </>
  );
}

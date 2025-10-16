import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type ConfirmationPageProps = {
  params: {
    id: string;
  };
};

export default function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  return (
    <div className="container mx-auto flex items-center justify-center px-4 py-12 md:px-6">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader className="items-center">
          <CheckCircle2 className="h-20 w-20 text-green-500" />
          <CardTitle className="mt-4 font-headline text-3xl">Order Confirmed!</CardTitle>
          <CardDescription className="text-base">
            Thank you for your order. We're preparing it now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-secondary p-4">
            <p className="text-sm text-muted-foreground">Your Order ID</p>
            <p className="break-all text-lg font-mono font-semibold">{params.id}</p>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href="/menu">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

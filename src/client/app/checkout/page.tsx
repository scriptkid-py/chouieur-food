import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckoutPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:px-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">
            Checkout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CheckoutForm />
        </CardContent>
      </Card>
    </div>
  );
}

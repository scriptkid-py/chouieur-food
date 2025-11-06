import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckoutPage() {
  return (
    <div className="container mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-8 md:px-6">
      <Card className="shadow-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="font-headline text-2xl sm:text-3xl text-primary">
            Checkout
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <CheckoutForm />
        </CardContent>
      </Card>
    </div>
  );
}

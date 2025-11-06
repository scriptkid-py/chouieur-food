import OrderConfirmationClient from './OrderConfirmationClient';

type ConfirmationPageProps = {
  params: Promise<{
    id: string;
  }> | {
    id: string;
  };
};

export default async function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  const resolvedParams = 'then' in params ? await params : params;
  return <OrderConfirmationClient orderId={resolvedParams.id} />;
}


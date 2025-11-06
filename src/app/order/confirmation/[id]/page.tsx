import OrderConfirmationClient from './OrderConfirmationClient';

type ConfirmationPageProps = {
  params: {
    id: string;
  };
};

export default function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  return <OrderConfirmationClient orderId={params.id} />;
}


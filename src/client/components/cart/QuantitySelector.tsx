import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

type QuantitySelectorProps = {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
};

export function QuantitySelector({ quantity, onQuantityChange }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onQuantityChange(quantity - 1)}
        disabled={quantity <= 1}
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">Decrease quantity</span>
      </Button>
      <span className="w-8 text-center text-lg font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onQuantityChange(quantity + 1)}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Increase quantity</span>
      </Button>
    </div>
  );
}

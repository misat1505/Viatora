'use client';

import { PropsWithChildren } from 'react';
import { Button } from '../ui/button';
import { CreateCheckoutDTO } from '@/generated/viatoraAPI.schemas';
import { checkoutPlan } from '@/actions/payments/checkout-plan';

type CheckoutButtonProps = PropsWithChildren & {
  isPopular: boolean;
  category: string;
  months: number;
};

const CheckoutButton = ({ children, isPopular, category, months }: CheckoutButtonProps) => {
  async function handleClick(dto: CreateCheckoutDTO) {
    const [error, result] = await checkoutPlan(dto);
    if (error) throw error;

    window.location.href = result.checkoutUrl;
  }

  return (
    <Button
      onClick={() => handleClick({ category, months })}
      className="w-full"
      variant={isPopular ? 'default' : 'outline'}
    >
      {children}
    </Button>
  );
};

export default CheckoutButton;

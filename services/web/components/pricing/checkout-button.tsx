'use client';

import { PropsWithChildren } from 'react';
import { Button } from '../ui/button';
import { CreateCheckoutDTO } from '@/generated/viatoraAPI.schemas';
import { checkoutPlan } from '@/actions/payments/checkout-plan';
import { toast } from 'sonner';
import GoogleOAuthLink from '../google-oauth-link';
import LocaleText from '../locale-text';

type CheckoutButtonProps = PropsWithChildren & {
  isPopular: boolean;
  category: string;
  months: number;
};

const CheckoutButton = ({ children, isPopular, category, months }: CheckoutButtonProps) => {
  async function handleClick(dto: CreateCheckoutDTO) {
    const [error, result] = await checkoutPlan(dto);
    if (error?.message === 'Unauthorized') {
      return toast.error(
        <GoogleOAuthLink className="[div:has(>div>&)]:w-full w-full">
          <LocaleText k="auth.loginRequired.googleButton" />
        </GoogleOAuthLink>,
      );
    }
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

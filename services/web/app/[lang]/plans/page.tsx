'use client';

import { checkoutPlan } from '@/actions/payments/checkout-plan';
import { Button } from '@/components/ui/button';
import { CreateCheckoutDTO } from '@/generated/viatoraAPI.schemas';

const PlanPage = () => {
  async function handleClick(dto: CreateCheckoutDTO) {
    const [error, result] = await checkoutPlan(dto);
    if (error) throw error;

    window.location.href = result.checkoutUrl;
  }

  return (
    <Button onClick={() => handleClick({ category: 'B', months: 1 })}>
      Buy plan for category B and 1 month
    </Button>
  );
};

export default PlanPage;

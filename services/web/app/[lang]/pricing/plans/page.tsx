import { getAllAvailablePlans } from '@/actions/payments/get-all-available-plans';
import { getUserSubscriptions } from '@/actions/payments/get-user-subscriptions';
import PricingTable from '@/components/pricing/pricing-table';
import { getDictionary, Locale } from '../../dictionaries';
import { notFound } from 'next/navigation';
import { getPricingTablePlans } from '@/utils/payments/get-pricing-table-plans';

const PlanPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ category?: string }>;
}) => {
  const { category } = await searchParams;
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const [allPlansError, allPlans] = await getAllAvailablePlans();
  const [, userSubscriptions] = await getUserSubscriptions();

  if (allPlansError) throw allPlansError;

  const resolvedCategory = category ?? 'B';

  const plans = getPricingTablePlans(allPlans, resolvedCategory, dict, lang);
  if (!plans) return notFound();

  return (
    <PricingTable
      category={resolvedCategory}
      plans={plans}
      dict={dict}
      userSubscriptions={userSubscriptions ?? []}
      locale={lang}
    />
  );
};

export default PlanPage;

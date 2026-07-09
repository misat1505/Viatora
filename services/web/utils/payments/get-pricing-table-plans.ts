import { getDictionary, Locale } from '@/app/[lang]/dictionaries';
import { PricingPlan } from '@/components/pricing/pricing-table';
import { GetAllAvailablePlansDTO } from '@/generated/viatoraAPI.schemas';

export function getPricingTablePlans(
  plans: GetAllAvailablePlansDTO['plans'],
  category: string,
  dict: Awaited<ReturnType<typeof getDictionary>>,
  locale: Locale,
): PricingPlan[] | null {
  const currentPlans = plans.find((p) => p.category === category);
  if (!currentPlans) return null;

  const localeMap: Record<Locale, string> = {
    pl: 'pl-PL',
    en: 'en-US',
  };

  const formatter = new Intl.NumberFormat(localeMap[locale], {
    style: 'currency',
    currency: currentPlans.currency,
  });

  return [
    {
      name: dict.pricing.plans.basic.name,
      price: formatter.format(currentPlans.price1Month / 100),
      monthlyPrice: formatter.format(currentPlans.price1Month / 100),
      description: dict.pricing.plans.basic.description,
      features: dict.pricing.plans.basic.features,
      months: 1,
    },
    {
      name: dict.pricing.plans.pro.name,
      price: formatter.format(currentPlans.price3Months / 100),
      monthlyPrice: formatter.format(currentPlans.price3Months / 300),
      description: dict.pricing.plans.pro.description,
      features: dict.pricing.plans.pro.features,
      months: 3,
      popular: true,
    },
    {
      name: dict.pricing.plans.premium.name,
      price: formatter.format(currentPlans.price6Months / 100),
      monthlyPrice: formatter.format(currentPlans.price6Months / 600),
      description: dict.pricing.plans.premium.description,
      features: dict.pricing.plans.premium.features,
      months: 6,
    },
  ];
}

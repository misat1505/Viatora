import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocalizedLink } from '../localized-link';
import CheckoutButton from './checkout-button';
import { getDictionary } from '@/app/[lang]/dictionaries';

export type PricingPlan = {
  name: string;
  price: string;
  monthlyPrice: string;
  description: string;
  features: string[];
  months: number;
  popular?: boolean;
};

export default function PricingTable({
  plans,
  category,
  dict,
}: {
  plans: PricingPlan[];
  category: string;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  return (
    <section className="bg-muted/30 w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6 2xl:max-w-350">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {dict.pricing.title}
            </h2>
            <p className="text-muted-foreground mx-auto max-w-175 md:text-xl/relaxed">
              {dict.pricing.subtitle}
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="flex flex-col gap-8">
              <Card
                className={cn(
                  'relative flex flex-1 flex-col',
                  plan.popular && 'border-primary shadow-md',
                )}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground absolute top-0 right-0 rounded-tr-lg rounded-bl-lg px-3 py-1 text-xs font-medium">
                    {dict.pricing.mostPopular}
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>

                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                    </div>

                    <p className="text-muted-foreground mt-1 text-sm font-medium">
                      {plan.monthlyPrice}
                      {dict.pricing.perMonth}
                    </p>
                  </div>

                  <p className="text-muted-foreground mt-4 text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckIcon className="text-primary mr-2 h-4 w-4" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <CheckoutButton
                    category={category}
                    isPopular={plan.popular ?? false}
                    months={plan.months}
                  >
                    {dict.pricing.cta}
                  </CheckoutButton>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

        <div className="bg-card mx-auto mt-16 max-w-3xl rounded-lg border p-8 text-center">
          <h3 className="text-xl font-medium">{dict.pricing.contact.title}</h3>
          <p className="text-muted-foreground mt-2">{dict.pricing.contact.description}</p>
          <Button className="mt-6" asChild>
            <LocalizedLink href="/contact">{dict.pricing.contact.button}</LocalizedLink>
          </Button>
        </div>
      </div>
    </section>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LocalizedLink } from '../localized-link';
import { Bike, Bus, Car, CheckCircle2, Truck } from 'lucide-react';
import { getDictionary, Locale } from '@/app/[lang]/dictionaries';

const categoryIcons: Record<string, typeof Bike> = {
  AM: Bike,
  A1: Bike,
  A2: Bike,
  A: Bike,
  B1: Car,
  B: Car,
  C: Truck,
  D: Bus,
};

const categoryIds = Object.keys(categoryIcons);

type Dict = Awaited<ReturnType<typeof getDictionary>>;

type Props = {
  resolvedCategory: string;
  userSubscriptions: {
    category: {
      category: string;
    };
    expiresAt: string;
  }[];
  dict: Dict;
  locale: Locale;
};

type Category = keyof Dict['pricing']['categories'];

export default function DrivingCategorySelector({
  resolvedCategory,
  userSubscriptions,
  dict,
  locale,
}: Props) {
  const activeSubscription = userSubscriptions.find(
    (subscription) => subscription.category.category === resolvedCategory,
  );

  const t = dict.pricing.categorySelector;

  const formattedDate = activeSubscription
    ? new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(activeSubscription.expiresAt))
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {categoryIds.map((id) => {
          const Icon = categoryIcons[id];
          const isActive = id === resolvedCategory;
          const label = dict.pricing.categories[id as Category]?.label ?? id;
          const description = dict.pricing.categories[id as Category]?.description ?? '';

          return (
            <LocalizedLink key={id} href={`/plans?category=${id}`}>
              <Card
                className={cn(
                  'relative cursor-pointer transition-all hover:border-primary hover:shadow-md',
                  isActive && 'border-primary bg-primary/5 ring-2 ring-primary',
                )}
              >
                <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                  {isActive && (
                    <CheckCircle2 className="text-primary absolute top-2 right-2 h-4 w-4" />
                  )}

                  <Icon className="h-6 w-6" />

                  <div>
                    <p className="text-base font-bold">{label}</p>
                    <p className="text-muted-foreground text-xs">{description}</p>
                  </div>
                </CardContent>
              </Card>
            </LocalizedLink>
          );
        })}
      </div>

      {activeSubscription && (
        <Card className="border border-primary">
          <CardContent className="flex items-center gap-3 p-5">
            <CheckCircle2 className="h-6 w-6 text-green-600" />

            <div>
              <p className="font-semibold">
                {t.activeTitle.replace('{category}', resolvedCategory)}
              </p>
              <p className="text-muted-foreground text-sm">
                {t.activeUntil.replace('{date}', formattedDate ?? '')}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">{t.canExtend}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LocalizedLink } from '../localized-link';
import { Bike, Bus, Car, CheckCircle2, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { getDictionary } from '@/app/[lang]/dictionaries';

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
};

type DrivingCategory = keyof Dict['pricing']['categories'];

export default function DrivingCategorySelector({
  resolvedCategory,
  userSubscriptions,
  dict,
}: Props) {
  const activeSubscription = userSubscriptions.find(
    (subscription) => subscription.category.category === resolvedCategory,
  );

  const t = dict.pricing.categorySelector;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {categoryIds.map((id) => {
          const Icon = categoryIcons[id];
          const isActive = id === resolvedCategory;
          const label = dict.pricing.categories[id as DrivingCategory]?.label ?? id;
          const description = dict.pricing.categories[id as DrivingCategory]?.description ?? '';

          return (
            <LocalizedLink key={id} href={`/pricing/plans?category=${id}`}>
              <Card
                className={cn(
                  'relative cursor-pointer transition-all hover:border-primary hover:shadow-md h-full',
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
                {t.activeUntil.replace(
                  '{date}',
                  format(new Date(activeSubscription.expiresAt), 'dd.MM.yyyy'),
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

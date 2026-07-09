import StartExamSessionButton from '@/components/start-exam-session-button';
import { LocalizedLink } from '@/components/localized-link';
import { cn } from '@/lib/utils';
import { categoryIcons, categoryIds } from '@/utils/driving-categories';
import { CheckCircle2, Lock } from 'lucide-react';

type StartExamTilesProps = {
  t: {
    categoriesTitle: string;
    categoriesSubtitle: string;
    validUntil: string;
    locked: string;
    unlock: string;
  };
  subscriptionsByCategory: Map<string, Date | string>;
  dateFormatter: Intl.DateTimeFormat;
};

export function StartExamTiles({ t, subscriptionsByCategory, dateFormatter }: StartExamTilesProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{t.categoriesTitle}</h2>
        <p className="text-muted-foreground text-sm">{t.categoriesSubtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {categoryIds.map((id) => {
          const Icon = categoryIcons[id];
          const expiresAt = subscriptionsByCategory.get(id);
          const isValid = !!expiresAt && new Date(expiresAt) > new Date();

          return (
            <div
              key={id}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-colors',
                isValid
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/30 border-dashed opacity-70',
              )}
            >
              {isValid ? (
                <CheckCircle2 className="text-primary absolute top-1.5 right-1.5 h-3.5 w-3.5" />
              ) : (
                <Lock className="text-muted-foreground absolute top-1.5 right-1.5 h-3 w-3" />
              )}

              <Icon className="h-5 w-5" />
              <p className="font-mono text-lg font-bold tracking-widest">{id}</p>

              {isValid ? (
                <p className="text-muted-foreground font-mono text-[10px]">
                  {t.validUntil.replace('{date}', dateFormatter.format(new Date(expiresAt)))}
                </p>
              ) : (
                <p className="text-muted-foreground text-[10px]">{t.locked}</p>
              )}

              {isValid ? (
                <StartExamSessionButton category={id} />
              ) : (
                <LocalizedLink
                  href={`/pricing/plans?category=${id}`}
                  className="text-primary text-[10px] font-medium underline underline-offset-2"
                >
                  {t.unlock}
                </LocalizedLink>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

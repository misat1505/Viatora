import type { Locale } from '@/app/[lang]/dictionaries';
import type { getDictionary } from '@/app/[lang]/dictionaries';

type Dict = Awaited<ReturnType<typeof getDictionary>>;
type Duration = 'one' | 'other';

export function formatDuration(months: number, dict: Dict, locale: Locale): string {
  const rules = new Intl.PluralRules(locale);
  const category = rules.select(months);

  const template = dict.pricing.duration[category as Duration] ?? dict.pricing.duration.other;

  return template.replace('{months}', String(months));
}

import { cookies } from 'next/headers';
import { Compass } from 'lucide-react';

import { Locale } from './dictionaries';
import { getDictionary } from './dictionaries';
import { buttonVariants } from '@/components/ui/button';
import { LocalizedLink } from '@/components/localized-link';
import { cn } from '@/lib/utils';

export default async function NotFound() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('NEXT_LOCALE')?.value as Locale) ?? ('pl' as Locale);
  const dict = await getDictionary(lang);
  const n = dict.notFound;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </div>

      <p className="mt-6 font-mono text-sm font-semibold tracking-[0.3em] text-muted-foreground">
        {n.code}
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {n.title}
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground md:text-base">{n.description}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <LocalizedLink href="/" className={cn(buttonVariants(), 'gap-2')}>
          {n.ctaHome}
        </LocalizedLink>
        <LocalizedLink href="/contact" className={buttonVariants({ variant: 'outline' })}>
          {n.ctaContact}
        </LocalizedLink>
      </div>
    </div>
  );
}

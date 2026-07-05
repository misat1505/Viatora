'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle, RotateCcw } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { LocalizedLink } from '@/components/localized-link';
import { cn } from '@/lib/utils';

// error.tsx MUSI być komponentem klienckim, więc nie może korzystać z
// serwerowego getDictionary(). Zamiast tego trzymamy tu mały, samodzielny
// zestaw tłumaczeń — jeśli Twój getDictionary da się bezpiecznie wywołać po
// stronie klienta (np. statyczny import JSON-a), możesz go tu podpiąć zamiast
// poniższej mapy.
const strings = {
  pl: {
    title: 'Coś poszło nie tak',
    description:
      'Napotkaliśmy nieoczekiwany błąd. Spróbuj ponownie — jeśli problem się powtarza, daj nam znać.',
    retry: 'Spróbuj ponownie',
    home: 'Wróć na stronę główną',
  },
  en: {
    title: 'Something went wrong',
    description:
      "We've hit an unexpected error. Try again — if the problem keeps happening, let us know.",
    retry: 'Try again',
    home: 'Back to home',
  },
} as const;

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang === 'en' ? 'en' : 'pl';
  const t = strings[lang];

  useEffect(() => {
    // TODO: podepnij pod swój system logowania błędów (np. Sentry)
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {t.title}
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground md:text-base">{t.description}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          {t.retry}
        </Button>
        <LocalizedLink href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
          {t.home}
        </LocalizedLink>
      </div>
    </div>
  );
}

import { LogIn } from 'lucide-react';

import GoogleOAuthLink from '@/components/google-oauth-link';
import { cn } from '@/lib/utils';
import { getDictionary, Locale } from '@/app/[lang]/dictionaries';

interface LoginRequiredProps {
  lang: Locale;
  className?: string;
}

export async function LoginRequired({ lang, className }: LoginRequiredProps) {
  const dict = await getDictionary(lang);
  const a = dict.auth.loginRequired;

  return (
    <div
      className={cn(
        'flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LogIn className="h-6 w-6" aria-hidden="true" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-foreground">{a.title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{a.description}</p>
      </div>

      <GoogleOAuthLink className="w-fit px-6">{a.googleButton}</GoogleOAuthLink>
    </div>
  );
}

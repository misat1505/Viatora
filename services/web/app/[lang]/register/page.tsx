import { GraduationCap } from 'lucide-react';

import { Locale } from '../dictionaries';
import { getDictionary } from '../dictionaries';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LocalizedLink } from '@/components/localized-link';
import GoogleOAuthLink from '@/components/google-oauth-link';
import { RegisterForm } from '@/components/register/register-form';

export default async function RegisterPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const lang = (await params).lang;
  const dict = await getDictionary(lang);

  const r = dict.register;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <GraduationCap className="h-8 w-8 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{r.title}</h1>
          <p className="text-sm text-muted-foreground">{r.subtitle}</p>
        </div>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <GoogleOAuthLink redirect="/account">{r.googleButton}</GoogleOAuthLink>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {r.divider}
              </span>
              <Separator className="flex-1" />
            </div>

            <RegisterForm dict={r.form} />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          {r.haveAccount}{' '}
          <LocalizedLink
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {r.signIn}
          </LocalizedLink>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          {r.termsPrefix}{' '}
          <LocalizedLink href="/terms" className="underline-offset-4 hover:underline">
            {r.termsLink}
          </LocalizedLink>{' '}
          {r.and}{' '}
          <LocalizedLink href="/privacy" className="underline-offset-4 hover:underline">
            {r.privacyLink}
          </LocalizedLink>
          .
        </p>
      </div>
    </div>
  );
}

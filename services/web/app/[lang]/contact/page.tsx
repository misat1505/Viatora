import { Mail, MapPin } from 'lucide-react';

import { Locale } from '../dictionaries';
import { getDictionary } from '../dictionaries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactForm } from '@/components/contact-form';

export default async function ContactPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const lang = (await params).lang;
  const dict = await getDictionary(lang);

  const c = dict.contact;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <header className="mb-10 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {c.title}
        </h1>
        <p className="leading-relaxed text-muted-foreground">{c.description}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Contact info */}
        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <CardTitle className="text-base">{c.emailLabel}</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={`mailto:${c.emailValue}`}
                className="text-sm text-foreground underline-offset-4 hover:underline"
              >
                {c.emailValue}
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <CardTitle className="text-base">{c.addressLabel}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{c.addressValue}</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact form */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">{c.formTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm
              dict={{
                nameLabel: c.form.nameLabel,
                namePlaceholder: c.form.namePlaceholder,
                emailLabel: c.form.emailLabel,
                emailPlaceholder: c.form.emailPlaceholder,
                messageLabel: c.form.messageLabel,
                messagePlaceholder: c.form.messagePlaceholder,
                submit: c.form.submit,
                submitting: c.form.submitting,
                success: c.form.success,
                error: c.form.error,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

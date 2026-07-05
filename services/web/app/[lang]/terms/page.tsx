import { Locale } from '../dictionaries';
import { getDictionary } from '../dictionaries';

export default async function TermsOfUsePage({ params }: { params: Promise<{ lang: Locale }> }) {
  const lang = (await params).lang;
  const dict = await getDictionary(lang);

  const t = dict.terms;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <header className="mb-10 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {t.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t.lastUpdated}: {t.lastUpdatedDate}
        </p>
      </header>

      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. {t.sections.general.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{t.sections.general.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">2. {t.sections.scope.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{t.sections.scope.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. {t.sections.account.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{t.sections.account.intro}</p>

          <ul className="list-disc space-y-1.5 pl-6 text-muted-foreground">
            {t.sections.account.items.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">4. {t.sections.usage.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{t.sections.usage.intro}</p>

          <ul className="list-disc space-y-1.5 pl-6 text-muted-foreground">
            {t.sections.usage.items.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">5. {t.sections.payments.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{t.sections.payments.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">6. {t.sections.ip.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{t.sections.ip.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">7. {t.sections.liability.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{t.sections.liability.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            8. {t.sections.complaints.title}
          </h2>
          <p className="leading-relaxed text-muted-foreground">{t.sections.complaints.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            9. {t.sections.termination.title}
          </h2>
          <p className="leading-relaxed text-muted-foreground">{t.sections.termination.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">10. {t.sections.changes.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{t.sections.changes.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">11. {t.sections.final.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{t.sections.final.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">12. {t.sections.contact.title}</h2>
          <p className="leading-relaxed text-muted-foreground">
            {t.sections.contact.content}{' '}
            <a
              href="mailto:kontakt@viatora.app"
              className="text-primary underline-offset-4 hover:underline"
            >
              kontakt@viatora.app
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}

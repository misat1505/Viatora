import { Locale } from '../dictionaries';
import { getDictionary } from '../dictionaries';

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const lang = (await params).lang;
  const dict = await getDictionary(lang);

  const p = dict.privacy;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <header className="mb-10 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {p.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {p.lastUpdated}: {p.lastUpdatedDate}
        </p>
      </header>

      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. {p.sections.general.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{p.sections.general.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            2. {p.sections.controller.title}
          </h2>
          <p className="leading-relaxed text-muted-foreground">{p.sections.controller.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. {p.sections.scope.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{p.sections.scope.intro}</p>

          <ul className="list-disc space-y-1.5 pl-6 text-muted-foreground">
            {p.sections.scope.items.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            4. {p.sections.legalBases.title}
          </h2>
          <p className="leading-relaxed text-muted-foreground">{p.sections.legalBases.intro}</p>

          <ul className="list-disc space-y-1.5 pl-6 text-muted-foreground">
            {p.sections.legalBases.items.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            5. {p.sections.recipients.title}
          </h2>
          <p className="leading-relaxed text-muted-foreground">{p.sections.recipients.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">6. {p.sections.ewr.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{p.sections.ewr.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">7. {p.sections.retention.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{p.sections.retention.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">8. {p.sections.rights.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{p.sections.rights.intro}</p>

          <ul className="list-disc space-y-1.5 pl-6 text-muted-foreground">
            {p.sections.rights.items.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className="leading-relaxed text-muted-foreground">{p.sections.rights.footer}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">9. {p.sections.cookies.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{p.sections.cookies.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">10. {p.sections.security.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{p.sections.security.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">11. {p.sections.changes.title}</h2>
          <p className="leading-relaxed text-muted-foreground">{p.sections.changes.content}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">12. {p.sections.contact.title}</h2>
          <p className="leading-relaxed text-muted-foreground">
            {p.sections.contact.content}{' '}
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

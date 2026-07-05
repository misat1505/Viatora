import {
  ArrowRight,
  BarChart3,
  Check,
  FileText,
  GitMerge,
  Gauge,
  HeartPulse,
  Languages,
  RefreshCw,
  Signpost,
  Timer,
} from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { LocalizedLink } from '@/components/localized-link';
import { RoadDivider } from '@/components/home/road-divider';
import { cn } from '@/lib/utils';
import { getDictionary, Locale } from './dictionaries';

const categoryIcons = [Signpost, GitMerge, Gauge, HeartPulse, FileText];
const featureIcons = [Languages, BarChart3, Timer, RefreshCw];

export default async function HomePage({ params }: { params: Promise<{ lang: Locale }> }) {
  const lang = (await params).lang;
  const dict = await getDictionary(lang);
  const h = dict.home;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {h.hero.eyebrow}
            </span>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
              {h.hero.title} <span className="text-primary">{h.hero.titleHighlight}</span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              {h.hero.subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <LocalizedLink
                href="/register"
                className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}
              >
                {h.hero.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </LocalizedLink>
              <LocalizedLink
                href="/questions"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                {h.hero.ctaSecondary}
              </LocalizedLink>
            </div>
          </div>

          {/* Mock question card — grounds the hero in the real product */}
          <div className="relative mx-auto w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {h.hero.questionCard.badge}
              </span>
              <span className="text-xs text-muted-foreground">{h.hero.questionCard.progress}</span>
            </div>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-3/5 rounded-full bg-primary" />
            </div>

            <p className="mt-5 text-sm font-medium leading-relaxed text-foreground">
              {h.hero.questionCard.question}
            </p>

            <div className="mt-4 space-y-2">
              {h.hero.questionCard.options.map((option: string, index: number) => {
                const correct = index === h.hero.questionCard.correctIndex;
                return (
                  <div
                    key={option}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm',
                      correct
                        ? 'border-primary/40 bg-primary/5 text-foreground'
                        : 'border-border text-muted-foreground',
                    )}
                  >
                    <span>{option}</span>
                    {correct && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <RoadDivider className="mx-auto max-w-6xl" />

      {/* Stats — styled like a dashboard instrument cluster */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {h.stats.map((stat: { value: string; label: string }) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-muted/40 px-6 py-8 text-center"
            >
              <div className="font-mono text-3xl font-bold tabular-nums text-primary md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {h.categories.eyebrow}
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {h.categories.title}
          </h2>
          <p className="mt-3 text-muted-foreground">{h.categories.subtitle}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {h.categories.items.map((item: { title: string; description: string }, index: number) => {
            const Icon = categoryIcons[index];
            return (
              <div
                key={item.title}
                className="rounded-xl border border-border p-5 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {Icon && <Icon className="h-5 w-5" />}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <RoadDivider className="mx-auto max-w-6xl" />

      {/* How it works — a genuine sequence, so numbering earns its place */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {h.steps.eyebrow}
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {h.steps.title}
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {h.steps.items.map((step: { title: string; description: string }, index: number) => (
            <div key={step.title} className="relative pl-12">
              <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-sm font-semibold text-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {h.features.eyebrow}
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {h.features.title}
          </h2>
          <p className="mt-3 text-muted-foreground">{h.features.subtitle}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {h.features.items.map((item: { title: string; description: string }, index: number) => {
            const Icon = featureIcons[index];
            return (
              <div key={item.title} className="flex gap-4 rounded-xl border border-border p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {Icon && <Icon className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  {index === 0 && (
                    <div className="mt-2 flex gap-1.5 text-base leading-none">
                      <span>🇵🇱</span>
                      <span>🇬🇧</span>
                      <span>🇺🇦</span>
                      <span>🇩🇪</span>
                      <span>🇷🇺</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <RoadDivider className="mx-auto max-w-6xl" />

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center md:py-20">
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {h.finalCta.title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">{h.finalCta.subtitle}</p>
        <LocalizedLink
          href="/register"
          className={cn(buttonVariants({ size: 'lg' }), 'mt-6 gap-2')}
        >
          {h.finalCta.cta}
          <ArrowRight className="h-4 w-4" />
        </LocalizedLink>
      </section>
    </>
  );
}

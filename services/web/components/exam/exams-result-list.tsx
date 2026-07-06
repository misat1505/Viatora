import Link from 'next/link';
import { ChevronRight, Timer, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Locale } from '@/app/[lang]/dictionaries';
import { SubmitExamResponseDTO } from '@/generated/viatoraAPI.schemas';

interface ExamResultsListProps {
  results: SubmitExamResponseDTO[];
  lang: Locale;
}

const dict = {
  pl: {
    passed: 'Zdany',
    failed: 'Niezdany',
    category: 'Kategoria',
    correctOf: (correct: number, total: number) => `${correct} / ${total} poprawnych`,
    points: (earned: number, max: number) => `${earned} / ${max} pkt`,
    empty: 'Nie masz jeszcze żadnych egzaminów',
    emptyHint: 'Twoje ukończone egzaminy pojawią się tutaj.',
  },
  en: {
    passed: 'Passed',
    failed: 'Failed',
    category: 'Category',
    correctOf: (correct: number, total: number) => `${correct} / ${total} correct`,
    points: (earned: number, max: number) => `${earned} / ${max} pts`,
    empty: "You don't have any exams yet",
    emptyHint: 'Your completed exams will show up here.',
  },
} as const;

const dateLocale = { pl: 'pl-PL', en: 'en-US' } as const;

function formatDate(iso: string, lang: Locale) {
  return new Intl.DateTimeFormat(dateLocale[lang] ?? 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatDuration(startedAt: string, completedAt: string) {
  const seconds = Math.max(
    0,
    Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000),
  );
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ScoreRing({ percent, passed }: { percent: number; passed: boolean }) {
  const size = 56;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all', passed ? 'stroke-primary' : 'stroke-destructive')}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold tabular-nums">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}

export function ExamResultsList({ results, lang }: ExamResultsListProps) {
  const t = dict[lang] ?? dict.en;

  if (results.length === 0) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-1 px-4 text-center">
        <ListChecks className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium">{t.empty}</p>
        <p className="text-sm text-muted-foreground">{t.emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-6 sm:px-6 sm:py-8">
      <ul className="flex flex-col gap-3">
        {results.map((result) => (
          <li key={result.sessionId}>
            <Link
              href={`/${lang}/exams/${result.sessionId}`}
              className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent sm:gap-5 sm:p-5"
            >
              <ScoreRing percent={result.scorePercent!} passed={result.passed!} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={cn(
                      result.passed
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-destructive text-destructive-foreground',
                    )}
                  >
                    {result.passed ? t.passed : t.failed}
                  </Badge>
                  <Badge variant="secondary">
                    {t.category} {result.category}
                  </Badge>
                </div>

                <p className="mt-2 text-sm font-medium leading-none">
                  {t.correctOf(result.correctAnswers!, result.totalQuestions)}
                  <span className="text-muted-foreground">
                    {' '}
                    · {t.points(result.earnedPoints!, result.maxPoints!)}
                  </span>
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{formatDate(result.completedAt!, lang)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Timer className="h-3 w-3" aria-hidden="true" />
                    {formatDuration(result.startedAt, result.completedAt!)}
                  </span>
                </div>
              </div>

              <ChevronRight
                className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

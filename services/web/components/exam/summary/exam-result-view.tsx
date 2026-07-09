'use client';

import Link from 'next/link';
import { Pie, PieChart, Cell, XAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { CheckCircle2, XCircle, Trophy, Clock, Target, ListChecks } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Locale } from '@/app/[lang]/dictionaries';
import { SubmitExamResponseDTO } from '@/generated/viatoraAPI.schemas';
import StartExamSessionButton from '@/components/start-exam-session-button';

interface ExamResultViewProps {
  result: SubmitExamResponseDTO;
  lang: Locale;
}

const dict = {
  pl: {
    title: 'Wynik egzaminu',
    passed: 'Zdany',
    failed: 'Niezdany',
    points: 'Punkty',
    correctAnswers: 'Poprawne odpowiedzi',
    time: 'Czas rozwiązywania',
    category: 'Kategoria',
    resultsBreakdown: 'Podział wyników',
    answersDistribution: 'Rozkład odpowiedzi',
    timePerQuestion: 'Czas na pytanie',
    avgTime: 'Śr. czas / pytanie',
    questionsList: 'Lista pytań',
    correct: 'Poprawne',
    incorrect: 'Błędne',
    question: 'Pytanie',
    seconds: 's',
    clickToReview: 'Kliknij, aby przejrzeć pytanie',
    retake: 'Rozpocznij ponownie',
  },
  en: {
    title: 'Exam result',
    passed: 'Passed',
    failed: 'Failed',
    points: 'Points',
    correctAnswers: 'Correct answers',
    time: 'Completion time',
    category: 'Category',
    resultsBreakdown: 'Results breakdown',
    answersDistribution: 'Answer distribution',
    timePerQuestion: 'Time per question',
    avgTime: 'Avg. time / question',
    questionsList: 'Question list',
    correct: 'Correct',
    incorrect: 'Incorrect',
    question: 'Question',
    seconds: 's',
    clickToReview: 'Click to review the question',
    retake: 'Retry Exam',
  },
} as const;

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}m ${seconds}s`;
}

export function ExamResultView({ result, lang }: ExamResultViewProps) {
  const t = dict[lang as keyof typeof dict] ?? dict.pl;

  const incorrectAnswers = result.totalQuestions - result!.correctAnswers!;
  const lostPoints = result!.maxPoints! - result!.earnedPoints!;

  const totalDurationSeconds =
    (new Date(result!.completedAt!).getTime() - new Date(result.startedAt).getTime()) / 1000;

  // Distinct answeredAt timestamps -> real per-question timing is available.
  const distinctTimestamps = new Set(result!.answers!.map((a) => a.answeredAt)).size;
  const hasPerQuestionTiming = distinctTimestamps > 1;

  const answersPieConfig = {
    correct: { label: t.correct, color: 'var(--primary)' },
    incorrect: { label: t.incorrect, color: 'var(--destructive)' },
  } satisfies ChartConfig;

  const answersPieData = [
    { key: 'correct', value: result.correctAnswers, fill: 'var(--color-correct)' },
    { key: 'incorrect', value: incorrectAnswers, fill: 'var(--color-incorrect)' },
  ];

  const pointsPieConfig = {
    earned: { label: t.points, color: 'var(--primary)' },
    lost: { label: t.incorrect, color: 'var(--destructive)' },
  } satisfies ChartConfig;

  const pointsPieData = [
    { key: 'earned', value: result.earnedPoints, fill: 'var(--color-earned)' },
    { key: 'lost', value: lostPoints, fill: 'var(--color-lost)' },
  ];

  const timeChartConfig = {
    seconds: { label: t.timePerQuestion, color: 'var(--primary)' },
  } satisfies ChartConfig;

  const startedAtMs = new Date(result.startedAt).getTime();

  const timeChartData = hasPerQuestionTiming
    ? result!.answers!.map((a, index) => {
        const prevTime =
          index === 0 ? startedAtMs : new Date(result!.answers![index - 1].answeredAt).getTime();
        const seconds = Math.max(
          0,
          Math.round((new Date(a.answeredAt).getTime() - prevTime) / 1000),
        );
        return {
          question: `${index + 1}`,
          seconds,
          fill: a.isCorrect ? 'var(--primary)' : 'var(--destructive)',
        };
      })
    : null;

  const avgTimePerQuestion = totalDurationSeconds / result.totalQuestions;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t.title}</h1>
          <div className="flex space-x-2 items-center mt-2">
            <p className="text-muted-foreground">
              {t.category} {result.category}
            </p>
            <Badge
              className="w-fit px-3 py-1 text-sm"
              variant={result.passed ? 'default' : 'destructive'}
            >
              {result.passed ? (
                <CheckCircle2 className="mr-1 size-4" />
              ) : (
                <XCircle className="mr-1 size-4" />
              )}
              {result.passed ? t.passed : t.failed}
            </Badge>
          </div>
        </div>
        <StartExamSessionButton category={result.category} className="p-6">
          {t.retake}
        </StartExamSessionButton>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.points}</CardTitle>
            <Trophy className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result.earnedPoints}
              <span className="text-base font-normal text-muted-foreground">
                {' '}
                / {result.maxPoints}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.correctAnswers}
            </CardTitle>
            <ListChecks className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result.correctAnswers}
              <span className="text-base font-normal text-muted-foreground">
                {' '}
                / {result.totalQuestions}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.time}</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalDurationSeconds)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.avgTime}</CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgTimePerQuestion.toFixed(1)}
              {t.seconds}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question tiles */}
      <Card>
        <CardHeader>
          <CardTitle>{t.questionsList}</CardTitle>
          <CardDescription>{t.clickToReview}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-16">
            {result!.answers!.map((answer, index) => (
              <Link
                key={answer.id}
                href={`/${lang}/q/${answer.questionSlug}?selected=${answer.selectedOption}`}
                title={`${t.question} ${index + 1}`}
                className={`flex aspect-square items-center justify-center rounded-md text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 ${
                  answer.isCorrect
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-destructive hover:bg-destructive/90'
                }`}
              >
                {index + 1}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.answersDistribution}</CardTitle>
            <CardDescription>
              {result.correctAnswers}/{result.totalQuestions}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={answersPieConfig} className="mx-auto aspect-square max-h-64">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={answersPieData} dataKey="value" nameKey="key" innerRadius={55}>
                  {answersPieData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="key" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.resultsBreakdown}</CardTitle>
            <CardDescription>
              {result.earnedPoints}/{result.maxPoints} {t.points.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pointsPieConfig} className="mx-auto aspect-square max-h-64">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={pointsPieData} dataKey="value" nameKey="key" innerRadius={55}>
                  {pointsPieData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="key" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {hasPerQuestionTiming && timeChartData && (
        <Card>
          <CardHeader>
            <CardTitle>{t.timePerQuestion}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={timeChartConfig} className="max-h-64 w-full">
              <AreaChart data={timeChartData}>
                <defs>
                  <linearGradient id="fillSeconds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-seconds)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-seconds)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="question" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="seconds"
                  type="monotone"
                  fill="url(#fillSeconds)"
                  stroke="var(--color-seconds)"
                  strokeWidth={2}
                  dot={({ cx, cy, payload }) => (
                    <circle
                      key={payload.question}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={payload.fill}
                      stroke="var(--background)"
                      strokeWidth={1}
                    />
                  )}
                  activeDot={({ cx, cy, payload }) => (
                    <circle
                      key={`active-dot-${payload.question}`}
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={payload.fill}
                      stroke="var(--background)"
                      strokeWidth={2}
                    />
                  )}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

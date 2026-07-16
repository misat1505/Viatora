'use client';

import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  CartesianGrid,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
} from 'recharts';
import { ListChecks, Percent, Target, Trophy, Flame, Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

// Shape of the stats JSON returned by the API.
export interface ExamStatsDTO {
  totalExams: number;
  passRate: number; // percentage, 0-100
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeMinutes: number;
}

// Shape of the i18n dictionary. Import the matching locale JSON
// (e.g. locales/en/stats.json or locales/pl/stats.json) and pass it in as `dict`.
export interface ExamStatsDict {
  title: string;
  subtitle: string;
  totalExams: string;
  passRate: string;
  averageScore: string;
  bestScore: string;
  currentStreak: string;
  longestStreak: string;
  totalTime: string;
  exams: string;
  points: string;
  minutesShort: string;
  passRateChartTitle: string;
  passRateChartDesc: string;
  passed: string;
  failed: string;
  scoreChartTitle: string;
  scoreChartDesc: string;
  average: string;
  best: string;
  streakChartTitle: string;
  streakChartDesc: string;
  current: string;
  longest: string;
}

interface ExamStatsViewProps {
  stats: ExamStatsDTO;
  dict: ExamStatsDict;
}

function formatMinutes(totalMinutes: number, unit: string) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0) return `${minutes}${unit}`;
  return `${hours}h ${minutes}${unit}`;
}

export function ExamStatsView({ stats, dict: t }: ExamStatsViewProps) {
  const failRate = Math.max(0, 100 - stats.passRate);

  const passRateConfig = {
    passed: { label: t.passed, color: 'var(--primary)' },
    failed: { label: t.failed, color: 'var(--destructive)' },
  } satisfies ChartConfig;

  const passRateData = [
    { key: 'passed', value: stats.passRate, fill: 'var(--color-passed)' },
    { key: 'failed', value: failRate, fill: 'var(--color-failed)' },
  ];

  const scoreConfig = {
    average: { label: t.average, color: 'var(--primary)' },
    best: { label: t.best, color: 'var(--secondary)' },
  } satisfies ChartConfig;

  const scoreData = [{ average: stats.averageScore, best: stats.bestScore }];

  const streakConfig = {
    current: { label: t.current, color: 'var(--primary)' },
    longest: { label: t.longest, color: 'var(--muted-foreground)' },
  } satisfies ChartConfig;

  const streakMax = Math.max(stats.longestStreak, stats.currentStreak, 1);
  const streakData = [
    {
      key: 'current',
      value: stats.currentStreak,
      fullMark: streakMax,
      fill: 'var(--color-current)',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t.title}</h1>
        <p className="mt-1 text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.totalExams}
            </CardTitle>
            <ListChecks className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExams}</div>
          </CardContent>
        </Card>

        <Card className="justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.passRate}
            </CardTitle>
            <Percent className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.passRate}%</div>
          </CardContent>
        </Card>

        <Card className="justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.averageScore}
            </CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}</div>
          </CardContent>
        </Card>

        <Card className="justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.bestScore}
            </CardTitle>
            <Trophy className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bestScore}</div>
          </CardContent>
        </Card>

        <Card className="justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.currentStreak}
            </CardTitle>
            <Flame className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.currentStreak}
              <span className="text-base font-normal text-muted-foreground">
                {' '}
                / {stats.longestStreak}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.totalTime}
            </CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMinutes(stats.totalTimeMinutes, t.minutesShort)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t.passRateChartTitle}</CardTitle>
            <CardDescription>{t.passRateChartDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={passRateConfig} className="mx-auto aspect-square max-h-64">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={passRateData} dataKey="value" nameKey="key" innerRadius={55}>
                  {passRateData.map((entry) => (
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
            <CardTitle>{t.scoreChartTitle}</CardTitle>
            <CardDescription>{t.scoreChartDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={scoreConfig} className="mx-auto aspect-square max-h-64">
              <BarChart data={scoreData}>
                <CartesianGrid vertical={false} />
                <XAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="average" fill="var(--color-average)" radius={4} maxBarSize={69} />
                <Bar dataKey="best" fill="var(--color-best)" radius={4} maxBarSize={69} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.streakChartTitle}</CardTitle>
            <CardDescription>{t.streakChartDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={streakConfig} className="mx-auto aspect-square max-h-64">
              <RadialBarChart
                data={streakData}
                innerRadius={70}
                outerRadius={110}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, streakMax]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar dataKey="value" background={{ fill: 'var(--muted)' }} cornerRadius={8} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </RadialBarChart>
            </ChartContainer>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {t.current}: {stats.currentStreak} · {t.longest}: {stats.longestStreak}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

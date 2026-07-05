'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Locale } from '@/app/[lang]/dictionaries';
import { ExamQuestionDTO } from '@/generated/viatoraAPI.schemas';

type AnswerKey = 'a' | 'b' | 'c';

interface QuestionViewProps {
  question: ExamQuestionDTO;
  userAnswer: string;
  lang: Locale;
}

const dict = {
  pl: {
    notAnswered: 'Nie odpowiedziano',
    yourAnswer: 'Twoja odpowiedź',
    correct: 'Poprawna odpowiedź!',
    incorrect: 'Niepoprawna odpowiedź',
    confirm: 'Zatwierdź odpowiedź',
    yes: 'Tak',
    no: 'Nie',
    noImage: 'Brak zdjęcia do tego pytania',
    pointsOne: 'punkt',
    pointsFew: 'punkty',
    pointsMany: 'punktów',
  },
  en: {
    notAnswered: 'Not answered',
    yourAnswer: 'Your answer',
    correct: 'Correct answer!',
    incorrect: 'Incorrect answer',
    confirm: 'Confirm answer',
    yes: 'Yes',
    no: 'No',
    noImage: 'No image for this question',
    pointsOne: 'point',
    pointsFew: 'points',
    pointsMany: 'points',
  },
} as const;

function formatPoints(n: number, lang: Locale) {
  const t = dict[lang] ?? dict.en;
  if (lang === 'pl') {
    const lastDigit = n % 10;
    const lastTwo = n % 100;
    const word =
      n === 1
        ? t.pointsOne
        : lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)
          ? t.pointsFew
          : t.pointsMany;
    return `${n} ${word}`;
  }
  return `${n} ${n === 1 ? t.pointsOne : t.pointsFew}`;
}

export function QuestionView({ question, userAnswer, lang }: QuestionViewProps) {
  const t = dict[lang] ?? dict.en;
  const isBasic = question.questionType === 'basic';
  const options: AnswerKey[] = isBasic ? ['a', 'b'] : ['a', 'b', 'c'];

  const [selected, setSelected] = useState<AnswerKey | ''>((userAnswer as AnswerKey) || '');
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    if (!selected) return;
    setPending(true);
    try {
      console.log(selected);
    } finally {
      setPending(false);
    }
  }

  function answerLabel(key: AnswerKey) {
    if (isBasic) return key === 'a' ? t.yes : t.no;
    return question.answers[key][lang] || question.answers[key].en;
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-background p-4 sm:p-6">
      <Card className="flex w-full max-w-2xl flex-col">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5"></div>
            <Badge variant="secondary">{formatPoints(question.points, lang)}</Badge>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {question.media.type === 'image' && question.media.url ? (
              <Image
                src={question.media.url}
                alt={question.text[lang] || question.text.en}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 640px"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageOff className="h-8 w-8" aria-hidden="true" />
                <span className="text-xs">{t.noImage}</span>
              </div>
            )}
          </div>

          <h1 className="text-balance text-xl font-semibold leading-snug sm:text-2xl">
            {question.text[lang] || question.text.en}
          </h1>
        </CardHeader>

        <CardContent className="flex-1">
          <RadioGroup
            value={selected}
            onValueChange={(value) => setSelected(value as AnswerKey)}
            disabled={pending}
            className={cn('grid gap-3', isBasic && 'sm:grid-cols-2')}
          >
            {options.map((key) => (
              <Label
                key={key}
                htmlFor={`answer-${key}`}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm transition-colors',
                  selected === key
                    ? 'border-primary bg-secondary text-secondary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <RadioGroupItem value={key} id={`answer-${key}`} />
                <span className="flex-1">{answerLabel(key)}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>

        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button onClick={handleSubmit} disabled={!selected || pending} className="w-full">
            {pending ? '...' : t.confirm}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

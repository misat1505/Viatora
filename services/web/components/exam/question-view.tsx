'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Locale } from '@/app/[lang]/dictionaries';
import { ExamQuestionDTO, ExamSessionDTO } from '@/generated/viatoraAPI.schemas';
import { answerQuestion } from '@/actions/exams/answer-question';
import { useRouter } from 'next/navigation';
import { sanityImageUrl } from '@/lib/sanity-image';
import { finishExam } from '@/actions/exams/finish-exam';

type AnswerKey = 'a' | 'b' | 'c';

interface QuestionViewProps {
  examId: ExamSessionDTO['sessionId'];
  question: ExamQuestionDTO;
  userAnswer: string;
  lang: Locale;
  nextQuestionSlug: ExamQuestionDTO['slug'];
  answeredQuestionsCount: number;
  totalQuestionsCount: number;
}

const dict = {
  pl: {
    confirm: 'Zatwierdź odpowiedź',
    finish: 'Zakończ egzamin',
    yes: 'Tak',
    no: 'Nie',
    noImage: 'Brak zdjęcia do tego pytania',
    question: 'Pytanie',
    pointsOne: 'punkt',
    pointsFew: 'punkty',
    pointsMany: 'punktów',
  },
  en: {
    confirm: 'Confirm answer',
    finish: 'Finish exam',
    yes: 'Yes',
    no: 'No',
    noImage: 'No image for this question',
    question: 'Question',
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

export function QuestionView({
  examId,
  question,
  userAnswer,
  lang,
  nextQuestionSlug,
  answeredQuestionsCount,
  totalQuestionsCount,
}: QuestionViewProps) {
  const router = useRouter();

  const t = dict[lang] ?? dict.en;
  const isBasic = question.questionType === 'basic';
  const isLastQuestion = nextQuestionSlug === 'STOP';
  const options: AnswerKey[] = isBasic ? ['a', 'b'] : ['a', 'b', 'c'];

  const [selected, setSelected] = useState<AnswerKey | ''>((userAnswer as AnswerKey) || '');
  const [pending, setPending] = useState(false);

  const progressPercent = (answeredQuestionsCount / totalQuestionsCount) * 100;

  async function handleSubmit() {
    if (!selected) return;
    setPending(true);
    try {
      await answerQuestion(examId, { questionId: question.id, userAnswer: selected });
      if (!isLastQuestion) {
        router.push(`/${lang}/exams/${examId}/q/${nextQuestionSlug}`);
      } else {
        await finishExam(examId);
        router.push(`/${lang}/exams/${examId}/summary`);
      }
    } finally {
      setPending(false);
    }
  }

  function answerLabel(key: AnswerKey) {
    if (isBasic) return key === 'a' ? t.yes : t.no;
    return question.answers[key][lang] || question.answers[key].en;
  }

  return (
    <div className="flex min-h-[calc(100svh-4rem)] w-full items-center justify-center bg-background p-3 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl overflow-hidden lg:max-w-4xl pt-0 gap-y-0 relative">
        {/* Media */}
        <div className="relative h-48 w-full bg-muted sm:h-64 lg:h-96">
          {question.media.type === 'image' && question.media.url ? (
            <Image
              src={sanityImageUrl(question.media.url)!}
              alt={question.text[lang] || question.text.en}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 900px"
              priority
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
              <span className="text-xs">{t.noImage}</span>
            </div>
          )}

          <div className="absolute left-3 top-3">
            <Badge className="bg-background/80 text-foreground backdrop-blur-sm">
              {t.question} {answeredQuestionsCount}/{totalQuestionsCount}
            </Badge>
          </div>
          <div className="absolute right-3 top-3">
            <Badge className="bg-background/80 text-foreground backdrop-blur-sm">
              {formatPoints(question.points, lang)}
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 w-full">
          <Progress value={progressPercent} className="h-1 rounded-none" />
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 lg:p-8">
          <div className="flex min-h-13 items-center sm:min-h-15">
            <h1 className="text-lg font-semibold leading-snug sm:text-xl">
              {question.text[lang] || question.text.en}
            </h1>
          </div>

          <RadioGroup
            value={selected}
            onValueChange={(value) => setSelected(value as AnswerKey)}
            disabled={pending}
            className={cn('mt-4 grid gap-3 lg:mt-6', isBasic && 'sm:grid-cols-2')}
          >
            {options.map((key) => {
              const isSelected = selected === key;
              return (
                <Label
                  key={key}
                  htmlFor={`answer-${key}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm transition-all lg:text-base',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/40 hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <RadioGroupItem value={key} id={`answer-${key}`} />
                  <span className="flex-1 leading-snug">{answerLabel(key)}</span>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  )}
                </Label>
              );
            })}
          </RadioGroup>

          <Button
            onClick={handleSubmit}
            disabled={!selected || pending}
            size="lg"
            className="mt-5 w-full lg:mt-6"
          >
            {pending ? '...' : isLastQuestion ? t.finish : t.confirm}
          </Button>
        </div>
      </Card>
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { ImageOff, CheckCircle2, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Locale } from '@/app/[lang]/dictionaries';
import { DetailedExamQuestionDTO } from '@/generated/viatoraAPI.schemas';
import { sanityImageUrl } from '@/lib/sanity-image';
import ChatGPTLogo from '@/assets/chatGPT-logo.webp';
import { buttonVariants } from '../ui/button';
import { AssistantAside } from './assistant-aside';

type AnswerKey = 'a' | 'b' | 'c';

interface QuestionBrowseViewProps {
  question: DetailedExamQuestionDTO;
  lang: Locale;
  selected?: string;
}

const dict = {
  pl: {
    noImage: 'Brak zdjęcia do tego pytania',
    question: 'Pytanie',
    correct: 'Poprawna',
    incorrect: 'Niepoprawna',
    yes: 'Tak',
    no: 'Nie',
    pointsOne: 'punkt',
    pointsFew: 'punkty',
    pointsMany: 'punktów',
    explanation: 'Wyjaśnienie',
  },
  en: {
    noImage: 'No image for this question',
    question: 'Question',
    correct: 'Correct',
    incorrect: 'Incorrect',
    yes: 'Yes',
    no: 'No',
    pointsOne: 'point',
    pointsFew: 'points',
    pointsMany: 'points',
    explanation: 'Explanation',
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

export function QuestionBrowseView({ question, lang, selected }: QuestionBrowseViewProps) {
  const t = dict[lang] ?? dict.en;
  const isBasic = question.questionType === 'basic';
  const options: AnswerKey[] = isBasic ? ['a', 'b'] : ['a', 'b', 'c'];

  const correctAnswer = question.answers.correctAnswer as AnswerKey;
  const selectedAnswer = (selected as AnswerKey) || undefined;
  const hasSelection = Boolean(selectedAnswer);
  const isSelectionCorrect = selectedAnswer === correctAnswer;

  const explanationText = question.explanation?.[lang] || question.explanation?.en;

  function answerLabel(key: AnswerKey) {
    if (isBasic) return key === 'a' ? t.yes : t.no;
    return question.answers[key][lang] || question.answers[key].en;
  }

  return (
    <div className="flex min-h-[calc(100svh-4rem)] w-full items-center justify-center bg-background p-3 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl overflow-hidden lg:max-w-4xl pt-0 gap-y-0">
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

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 lg:left-4">
            {question.categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="bg-background/80 text-foreground backdrop-blur-sm"
              >
                {category}
              </Badge>
            ))}
          </div>
          <div className="absolute right-3 top-3 lg:right-4">
            <Badge className="bg-background/80 text-foreground backdrop-blur-sm">
              {formatPoints(question.points, lang)}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 lg:p-8">
          <div className="flex min-h-13 items-center sm:min-h-15">
            <h1 className="text-lg font-semibold leading-snug sm:text-xl">
              {question.text[lang] || question.text.en}
            </h1>
          </div>

          <div className={cn('mt-4 grid gap-3 lg:mt-6', isBasic && 'sm:grid-cols-2')}>
            {options.map((key) => {
              const isCorrect = key === correctAnswer;
              const isSelected = hasSelection && key === selectedAnswer;
              const showAsWrong = isSelected && !isSelectionCorrect;

              return (
                <Link
                  key={key}
                  href={`?selected=${key}`}
                  scroll={false}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-4 text-sm transition-all lg:text-base',
                    isCorrect
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : showAsWrong
                        ? 'border-destructive bg-destructive/5 ring-1 ring-destructive'
                        : 'border-border hover:border-primary/40 hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <span className="flex-1 leading-snug">{answerLabel(key)}</span>

                  {isCorrect && hasSelection && (
                    <Badge className="shrink-0 bg-primary text-primary-foreground">
                      <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
                      {t.correct}
                    </Badge>
                  )}
                  {showAsWrong && (
                    <Badge variant="destructive" className="shrink-0">
                      <XCircle className="mr-1 h-3 w-3" aria-hidden="true" />
                      {t.incorrect}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {explanationText && (
            <div className="mt-4 flex gap-2.5 rounded-lg border border-border bg-muted/50 p-4 text-sm lg:mt-6 relative">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="mb-1 font-medium text-foreground">{t.explanation}</p>
                <p className="leading-relaxed text-muted-foreground">{explanationText}</p>
              </div>
              <a
                href={`https://chatgpt.com/?prompt=${encodeURIComponent(question.text[lang])}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: 'default',
                  className: 'absolute right-4 top-1/2 -translate-y-1/2',
                })}
              >
                <Image src={ChatGPTLogo} alt="ChatGPT" width={20} height={20} className="h-5 w-5" />
              </a>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Badge key={tag} className="bg-background/80 text-foreground backdrop-blur-sm">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      <AssistantAside questionId={question.id} lang={lang} />
    </div>
  );
}

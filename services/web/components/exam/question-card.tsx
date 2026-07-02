import Image from 'next/image';
import { Locale } from '@/app/[lang]/dictionaries';
import { ExamSessionDTO } from '@/generated/viatoraAPI.schemas';
import { sanityImageUrl } from '@/lib/sanity-image';

const answerLabels = ['a', 'b', 'c'] as const;

export function QuestionCard({
  entry,
  index,
  lang,
}: {
  entry: ExamSessionDTO['questions'][number];
  index: number;
  lang: Locale;
}) {
  const { question, userAnswer } = entry;
  const imageUrl = sanityImageUrl(question.media.url);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {imageUrl && (
        <div className="relative aspect-square w-full bg-muted sm:aspect-video">
          <Image
            src={imageUrl}
            alt={question.text[lang]}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 640px"
            priority={index === 0}
          />
        </div>
      )}

      <div className="p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Pytanie {index + 1}
          </span>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            {question.points} {question.points === 1 ? 'punkt' : 'punkty'}
          </span>
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            {question.questionType}
          </span>
          <div className="ml-auto flex flex-wrap gap-1">
            {question.categories.map((cat) => (
              <span
                key={cat}
                className="rounded border border-border px-1.5 py-0.5 text-xs font-semibold text-muted-foreground"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-card-foreground">{question.text[lang]}</h2>

        <div className="space-y-2">
          {answerLabels.map((label) => {
            const isCorrect = label === question.answers.correctAnswer;
            const isSelected = label === userAnswer;

            return (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                  isCorrect
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : isSelected
                      ? 'border-destructive/50 bg-destructive/10 text-destructive'
                      : 'border-border text-card-foreground'
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold uppercase">
                  {label}
                </span>
                <span>{question.answers[label][lang]}</span>
                {isCorrect && (
                  <span className="ml-auto text-xs font-semibold uppercase tracking-wide">
                    Poprawna
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {question.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {imageUrl && (
        <div className="relative aspect-square w-full bg-slate-100 sm:aspect-video">
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
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            Pytanie {index + 1}
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {question.points} {question.points === 1 ? 'punkt' : 'punkty'}
          </span>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            {question.questionType}
          </span>
          <div className="ml-auto flex flex-wrap gap-1">
            {question.categories.map((cat) => (
              <span
                key={cat}
                className="rounded border border-slate-200 px-1.5 py-0.5 text-xs font-semibold text-slate-500"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-slate-900">{question.text[lang]}</h2>

        <div className="space-y-2">
          {answerLabels.map((label) => {
            const isCorrect = label === question.answers.correctAnswer;
            const isSelected = label === userAnswer;

            return (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                  isCorrect
                    ? 'border-green-300 bg-green-50 text-green-800'
                    : isSelected
                      ? 'border-red-300 bg-red-50 text-red-800'
                      : 'border-slate-200 text-slate-700'
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
                className="rounded-full bg-slate-50 px-2 py-0.5 text-xs text-slate-500"
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

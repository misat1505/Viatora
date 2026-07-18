import { ArrowUpRight } from 'lucide-react';

import { getQuestionByFilters } from '@/actions/questions/get-question-by-filters';
import { GetQuestionsQueryDTO } from '@/generated/viatoraAPI.schemas';
import { getDictionary, Locale } from '../../app/[lang]/dictionaries';
import { LocalizedLink } from '../localized-link';
import { UnauthorizedError } from '@/utils/error';
import { LoginRequired } from '../login-required';

type Dict = Awaited<ReturnType<typeof getDictionary>>;

type QuestionsBrowserProps = {
  filters: GetQuestionsQueryDTO;
  dictionary: Dict['questions']['list'];
};

const QuestionsBrowser = async ({ filters, dictionary }: QuestionsBrowserProps) => {
  const lang = (filters.lang ?? 'pl') as Locale;

  const [error, questions] = await getQuestionByFilters(filters);
  if (error instanceof UnauthorizedError) {
    return <LoginRequired lang={lang} />;
  }

  if (error) throw error;

  return (
    <div className="space-y-3">
      {questions.map((question) => (
        <div
          key={question.id}
          className="group flex items-center gap-4 rounded-xl border bg-card p-5 transition hover:border-primary/40"
        >
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-semibold leading-relaxed">{question.text?.[lang]}</h2>

              <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                {question.points} {dictionary.points}
              </span>
            </div>

            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <LocalizedLink
            href={`/q/${question.slug}`}
            aria-label={dictionary.viewQuestion}
            className="flex shrink-0 items-center justify-center rounded-full border bg-muted p-2 text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground"
          >
            <ArrowUpRight className="h-4 w-4" />
          </LocalizedLink>
        </div>
      ))}
    </div>
  );
};

export default QuestionsBrowser;

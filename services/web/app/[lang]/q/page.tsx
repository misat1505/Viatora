import QuestionFilters from '@/components/questions/question-filter';
import { Locale, getDictionary } from '../dictionaries';
import QuestionsBrowser from '@/components/questions/questions-browser';

type QuestionBrowserPageProps = {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    points?: string;
    tags?: string;
  }>;
};

const QuestionBrowserPage = async ({ params, searchParams }: QuestionBrowserPageProps) => {
  const { lang } = await params;
  const search = await searchParams;

  const dictionary = await getDictionary(lang);

  const page = Number(search.page ?? 1);
  const limit = Number(search.limit ?? 10);
  const points = Number(search.points ?? 3);
  const tags = search.tags?.split(',').filter(Boolean) ?? [];

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-2 py-8">
      <div>
        <h1 className="text-3xl font-bold">{dictionary.questions.browserTitle}</h1>

        <p className="text-muted-foreground">{dictionary.questions.browserDescription}</p>
      </div>

      <QuestionFilters
        page={page}
        limit={limit}
        points={points}
        tags={tags}
        dictionary={dictionary.questions.filters}
      />

      <QuestionsBrowser
        filters={{
          lang,
          limit,
          page,
          points,
          tags,
        }}
        dictionary={dictionary.questions.list}
      />
    </div>
  );
};

export default QuestionBrowserPage;

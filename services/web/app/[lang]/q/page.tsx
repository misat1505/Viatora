import QuestionFilters from '@/components/questions/question-filter';
import { Locale } from '../dictionaries';

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

  const page = Number(search.page ?? 1);
  const limit = Number(search.limit ?? 25);

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">Question Browser</h1>
        <p className="text-muted-foreground">Browse and filter driving exam questions.</p>
      </div>

      <QuestionFilters
        page={page}
        limit={limit}
        points={Number(search.points ?? 3)}
        tags={search.tags?.split(',').filter(Boolean) ?? []}
      />
    </div>
  );
};

export default QuestionBrowserPage;

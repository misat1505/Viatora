import { getQuestionBySlug } from '@/actions/questions/get-question-by-slug';
import { Locale } from '../../dictionaries';

const QuestionPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lang: Locale }>;
  searchParams: Promise<{ selected?: string }>;
}) => {
  const { slug } = await params;
  const { selected } = await searchParams;

  const question = await getQuestionBySlug(slug);

  return (
    <div>
      Will fetch and display question of slug {slug} with searchParams {selected}
      {JSON.stringify(question, null, 2)}
    </div>
  );
};

export default QuestionPage;

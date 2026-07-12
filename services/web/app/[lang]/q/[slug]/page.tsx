import { getQuestionBySlug } from '@/actions/questions/get-question-by-slug';
import { Locale } from '../../dictionaries';
import { QuestionBrowseView } from '@/components/questions/question-browse-view';
import { NotFoundError, UnauthorizedError } from '@/utils/error';
import { notFound } from 'next/navigation';
import { LoginRequired } from '@/components/login-required';

const QuestionPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lang: Locale }>;
  searchParams: Promise<{ selected?: string }>;
}) => {
  const { slug, lang } = await params;
  const { selected } = await searchParams;

  const [error, question] = await getQuestionBySlug(slug);
  if (error instanceof NotFoundError) return notFound();
  if (error instanceof UnauthorizedError) {
    return <LoginRequired lang={lang} />;
  }
  if (error) throw error;

  return <QuestionBrowseView question={question} selected={selected} lang={lang} />;
};

export default QuestionPage;

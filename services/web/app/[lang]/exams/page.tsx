import { getExamsResults } from '@/actions/exams/get-exams-result';
import { ExamResultsList } from '@/components/exam/exams-result-list';
import { Locale } from '../dictionaries';

const ExamBrowserPage = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params;

  const [error, exams] = await getExamsResults();
  if (error) throw error;

  return <ExamResultsList results={exams} lang={lang} />;
};

export default ExamBrowserPage;

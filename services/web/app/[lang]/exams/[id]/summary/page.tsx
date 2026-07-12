import { getExamResult } from '@/actions/exams/get-exam-result';
import { Locale } from '@/app/[lang]/dictionaries';
import { ExamResultView } from '@/components/exam/summary/exam-result-view';
import { LoginRequired } from '@/components/login-required';
import { NotFoundError, UnauthorizedError } from '@/utils/error';
import { notFound } from 'next/navigation';

const ExamResultPage = async ({ params }: { params: Promise<{ id: string; lang: Locale }> }) => {
  const { id: examId, lang } = await params;
  const [error, examResult] = await getExamResult(examId);
  if (error instanceof NotFoundError) return notFound();
  if (error instanceof UnauthorizedError) {
    return <LoginRequired lang={lang} />;
  }

  if (error) throw error;

  return <ExamResultView result={examResult} lang={lang} />;
};

export default ExamResultPage;

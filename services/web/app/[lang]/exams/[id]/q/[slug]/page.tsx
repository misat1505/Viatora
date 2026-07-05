import { getExamById } from '@/actions/exams/get-exam-by-id';
import { Locale } from '@/app/[lang]/dictionaries';
import { NotFoundError } from '@/utils/error';
import { notFound } from 'next/navigation';

const ExamQuestionPage = async ({
  params,
}: {
  params: Promise<{ id: string; lang: Locale; slug: string }>;
}) => {
  const { id: examId, lang, slug: questionSlug } = await params;

  const [error, exam] = await getExamById(examId);
  if (error instanceof NotFoundError) return notFound();

  if (error) throw error;

  const currentQuestion = exam.questions.find((q) => q.question.slug === questionSlug);
  if (!currentQuestion) return notFound();

  const isCurrentQuestionValid = currentQuestion.question.id === exam.currentQuestionId;
  if (!isCurrentQuestionValid) return <div>You cant answer to this question now.</div>;

  return <div>{JSON.stringify(currentQuestion, null, 2)}</div>;
};

export default ExamQuestionPage;

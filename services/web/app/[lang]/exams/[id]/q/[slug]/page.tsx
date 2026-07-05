import { getExamById } from '@/actions/exams/get-exam-by-id';
import { Locale } from '@/app/[lang]/dictionaries';
import { QuestionView } from '@/components/exam/question-view';
import { LoginRequired } from '@/components/login-required';
import { NotFoundError, UnauthorizedError } from '@/utils/error';
import { notFound } from 'next/navigation';

const ExamQuestionPage = async ({
  params,
}: {
  params: Promise<{ id: string; lang: Locale; slug: string }>;
}) => {
  const { id: examId, lang, slug } = await params;
  const decodedQuestionSlug = decodeURIComponent(slug);

  const [error, exam] = await getExamById(examId);
  if (error instanceof NotFoundError) return notFound();
  if (error instanceof UnauthorizedError) {
    return <LoginRequired lang={lang} />;
  }

  if (error) throw error;

  const currentQuestionAbsoluteId = exam.questions.findIndex(
    (q) => q.question.slug === decodedQuestionSlug,
  );
  const currentQuestion = exam.questions[currentQuestionAbsoluteId];
  if (!currentQuestion) return notFound();

  const isCurrentQuestionValid = currentQuestion.question.id === exam.currentQuestionId;
  if (!isCurrentQuestionValid) return <div>You cant answer to this question now.</div>;

  const nextQuestionSlug =
    currentQuestionAbsoluteId + 1 >= exam.questions.length
      ? 'STOP'
      : exam.questions[currentQuestionAbsoluteId + 1].question.slug;

  return (
    <QuestionView
      examId={exam.sessionId}
      question={currentQuestion.question}
      userAnswer={currentQuestion.userAnswer}
      lang={lang}
      nextQuestionSlug={nextQuestionSlug}
      answeredQuestionsCount={currentQuestionAbsoluteId + 1}
      totalQuestionsCount={exam.totalQuestions}
    />
  );
};

export default ExamQuestionPage;

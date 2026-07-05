import { getExamById } from '@/actions/exams/get-exam-by-id';
import { Locale } from '@/app/[lang]/dictionaries';
import { QuestionView } from '@/components/exam/question-view';
import GoogleOAuthLink from '@/components/google-oauth-link';
import { NotFoundError, UnauthorizedError } from '@/utils/error';
import { notFound } from 'next/navigation';

const ExamQuestionPage = async ({
  params,
}: {
  params: Promise<{ id: string; lang: Locale; slug: string }>;
}) => {
  const { id: examId, lang, slug: questionSlug } = await params;

  const [error, exam] = await getExamById(examId);
  if (error instanceof NotFoundError) return notFound();
  if (error instanceof UnauthorizedError) {
    return (
      <div>
        <p>Login to use this feature.</p>
        <GoogleOAuthLink>Login with Google</GoogleOAuthLink>
      </div>
    );
  }

  if (error) throw error;

  const currentQuestion = exam.questions.find((q) => q.question.slug === questionSlug);
  if (!currentQuestion) return notFound();

  const isCurrentQuestionValid = currentQuestion.question.id === exam.currentQuestionId;
  if (!isCurrentQuestionValid) return <div>You cant answer to this question now.</div>;

  return (
    <QuestionView
      question={currentQuestion.question}
      userAnswer={currentQuestion.userAnswer}
      lang={lang}
    />
  );
};

export default ExamQuestionPage;

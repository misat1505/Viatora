import { getExamById } from '@/actions/exams/get-exam-by-id';
import { Locale } from '../../dictionaries';
import { redirect } from 'next/navigation';

const ExamPage = async ({ params }: { params: Promise<{ id: string; lang: Locale }> }) => {
  const { id: examId, lang } = await params;
  const [error, exam] = await getExamById(examId);

  if (error) throw error;

  if (exam.currentQuestionId === 'STOP') return redirect(`/${lang}/exams/${examId}/summary`);

  const currentQuestion = exam.questions.find((q) => q.question.id === exam.currentQuestionId);
  if (!currentQuestion) throw Error('Current question not found');

  return redirect(`/${lang}/exams/${exam.sessionId}/q/${currentQuestion.question.slug}`);
};

export default ExamPage;

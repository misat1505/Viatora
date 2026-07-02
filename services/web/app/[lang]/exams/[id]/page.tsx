import { getExamById } from '@/actions/exams/get-exam-by-id';
import { QuestionCard } from '@/components/exam/question-card';
import { Locale } from '../../dictionaries';

const ExamPage = async ({ params }: { params: Promise<{ id: string; lang: string }> }) => {
  const examId = (await params).id;
  const lang = (await params).lang;
  const [error, exam] = await getExamById(examId);

  if (error) throw error;

  const minutes = Math.floor(exam.timeLimitSeconds / 60);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Egzamin</h1>
          <p className="text-sm text-slate-500">
            {exam.totalQuestions} {exam.totalQuestions === 1 ? 'pytanie' : 'pytań'} · limit czasu:{' '}
            {minutes} min
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono text-slate-500">
          {exam.sessionId.slice(0, 8)}
        </span>
      </div>

      <div className="space-y-6">
        {exam.questions.map((entry, index) => (
          <QuestionCard key={entry.question.id} entry={entry} index={index} lang={lang as Locale} />
        ))}
      </div>
    </div>
  );
};

export default ExamPage;

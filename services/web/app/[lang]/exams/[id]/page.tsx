import { getExamById } from '@/actions/exams/get-exam-by-id';

const ExamPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const examId = (await params).id;
  const exam = await getExamById(examId);

  return <div>{JSON.stringify(exam)}</div>;
};

export default ExamPage;

import { getExamsResults } from '@/actions/exams/get-exams-result';

const ExamBrowserPage = async () => {
  const exams = await getExamsResults();

  return <div>{JSON.stringify(exams, null, 2)}</div>;
};

export default ExamBrowserPage;

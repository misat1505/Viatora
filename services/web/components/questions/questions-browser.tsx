import { getQuestionByFilters } from '@/actions/questions/get-question-by-filters';
import { GetQuestionsQueryDto } from '@/generated/viatoraAPI.schemas';

type QuestionsBrowserProps = { filters: GetQuestionsQueryDto };

const QuestionsBrowser = async ({ filters }: QuestionsBrowserProps) => {
  const [error, questions] = await getQuestionByFilters(filters);
  if (error) throw error;

  return <>{JSON.stringify(questions, null, 2)}</>;
};

export default QuestionsBrowser;

import { getStatisticsSummary } from '@/actions/statistics/get-statistics-summary';
import { getDictionary, Locale } from '../dictionaries';
import { UnauthorizedError } from '@/utils/error';
import { LoginRequired } from '@/components/login-required';
import { ExamStatsView } from '@/components/stats/stats-view';

type StatisticsPageProps = { params: Promise<{ lang: Locale }> };

const StatisticsPage = async ({ params }: StatisticsPageProps) => {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const [error, stats] = await getStatisticsSummary();
  if (error instanceof UnauthorizedError) return <LoginRequired lang={lang} />;

  if (error) throw error;

  return <ExamStatsView stats={stats} dict={dict.stats} />;
};

export default StatisticsPage;

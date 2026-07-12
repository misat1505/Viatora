import { getExamsResults } from '@/actions/exams/get-exams-result';
import { ExamResultsList } from '@/components/exam/exams-result-list';
import { getDictionary, Locale } from '../dictionaries';
import { StartExamTiles } from '@/components/exam/start-exam-tiles';
import { getUserSubscriptions } from '@/actions/payments/get-user-subscriptions';
import { LoginRequired } from '@/components/login-required';
import { UnauthorizedError } from '@/utils/error';

const ExamBrowserPage = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const t = dict.account;

  const [error, exams] = await getExamsResults();
  if (error instanceof UnauthorizedError) {
    return <LoginRequired lang={lang} />;
  }
  if (error) throw error;

  const [, userSubscriptions] = await getUserSubscriptions();
  const subscriptionsByCategory = new Map(
    (userSubscriptions ?? []).map((s) => [s.category.category, s.expiresAt]),
  );

  const dateFormatter = new Intl.DateTimeFormat(lang, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-5xl mt-4">
      <StartExamTiles
        t={{
          categoriesTitle: t.categoriesTitle,
          categoriesSubtitle: t.categoriesSubtitle,
          validUntil: t.validUntil,
          locked: t.locked,
          unlock: t.unlock,
        }}
        subscriptionsByCategory={subscriptionsByCategory}
        dateFormatter={dateFormatter}
      />
      <ExamResultsList results={exams} lang={lang} />
    </div>
  );
};

export default ExamBrowserPage;

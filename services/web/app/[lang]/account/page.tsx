import { getCurrentUser } from '@/actions/get-current-user';
import { getUserSubscriptions } from '@/actions/payments/get-user-subscriptions';
import { LoginRequired } from '@/components/login-required';
import LogoutButton from '@/components/logout-button';
import StartExamSessionButton from '@/components/start-exam-session-button';
import { LocalizedLink } from '@/components/localized-link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UnauthorizedError } from '@/utils/error';
import { cn } from '@/lib/utils';
import { categoryIcons, categoryIds } from '@/utils/driving-categories';
import { getDictionary, Locale } from '../dictionaries';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Lock,
  Settings,
  Tag,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const AccountPage = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const t = dict.account;

  const [error, userData] = await getCurrentUser();

  if (error instanceof UnauthorizedError) {
    return <LoginRequired lang={lang} />;
  }
  if (error) throw error;

  const user = userData.user;

  const [, userSubscriptions] = await getUserSubscriptions();
  const subscriptionsByCategory = new Map(
    (userSubscriptions ?? []).map((s) => [s.category.category, s.expiresAt]),
  );

  const dateFormatter = new Intl.DateTimeFormat(lang, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const quickLinks = [
    {
      href: '/exams',
      icon: ClipboardList,
      title: t.links.exams.title,
      description: t.links.exams.description,
    },
    {
      href: '/q',
      icon: BookOpen,
      title: t.links.questions.title,
      description: t.links.questions.description,
    },
    {
      href: '/statistics',
      icon: BarChart3,
      title: t.links.stats.title,
      description: t.links.stats.description,
    },
    {
      href: '/settings',
      icon: Settings,
      title: t.links.settings.title,
      description: t.links.settings.description,
    },
    {
      href: '/pricing/plans',
      icon: Tag,
      title: t.links.pricing.title,
      description: t.links.pricing.description,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-10">
      <Card>
        <CardContent className="flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center">
          <Avatar className="border-primary/20 size-16 border-2">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback className="text-lg font-semibold">
              {user.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">
                {t.greeting.replace('{name}', user.displayName)}
              </h1>
              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                {user.isActive ? t.statusActive : t.statusInactive}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <p className="text-muted-foreground font-mono text-xs">
              {t.memberSince.replace('{date}', dateFormatter.format(new Date(user.createdAt)))}
              {' · '}
              {t.lastLogin.replace('{date}', dateFormatter.format(new Date(user.lastLoginAt)))}
            </p>
          </div>

          <LogoutButton>{t.logout}</LogoutButton>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{t.categoriesTitle}</h2>
          <p className="text-muted-foreground text-sm">{t.categoriesSubtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categoryIds.map((id) => {
            const Icon = categoryIcons[id];
            const expiresAt = subscriptionsByCategory.get(id);
            const isValid = !!expiresAt && new Date(expiresAt) > new Date();

            return (
              <div
                key={id}
                className={cn(
                  'relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-colors',
                  isValid
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/30 border-dashed opacity-70',
                )}
              >
                {isValid ? (
                  <CheckCircle2 className="text-primary absolute top-1.5 right-1.5 h-3.5 w-3.5" />
                ) : (
                  <Lock className="text-muted-foreground absolute top-1.5 right-1.5 h-3 w-3" />
                )}

                <Icon className="h-5 w-5" />
                <p className="font-mono text-lg font-bold tracking-widest">{id}</p>

                {isValid ? (
                  <p className="text-muted-foreground font-mono text-[10px]">
                    {t.validUntil.replace('{date}', dateFormatter.format(new Date(expiresAt!)))}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-[10px]">{t.locked}</p>
                )}

                {isValid ? (
                  <StartExamSessionButton category={id} />
                ) : (
                  <LocalizedLink
                    href={`/pricing/plans?category=${id}`}
                    className="text-primary text-[10px] font-medium underline underline-offset-2"
                  >
                    {t.unlock}
                  </LocalizedLink>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">{t.quickLinksTitle}</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <LocalizedLink key={link.href} href={link.href}>
                <Card className="group hover:border-primary h-full transition-all hover:shadow-md">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{link.title}</p>
                      <p className="text-muted-foreground mt-1 text-sm">{link.description}</p>
                    </div>
                    <ChevronRight className="text-muted-foreground mt-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              </LocalizedLink>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AccountPage;

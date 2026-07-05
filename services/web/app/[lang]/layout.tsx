import Providers from '@/providers';
import { getDictionary, Locale } from './dictionaries';
import LocaleProvider from '@/providers/locale-provider';
import { getServerPalette } from '@/lib/get-server-pallette';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export async function generateStaticParams() {
  return [{ lang: 'pl' }, { lang: 'en' }];
}

export default async function LangLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const lang = (await params).lang as Locale;
  const [dict, pallette] = await Promise.all([getDictionary(lang), getServerPalette()]);

  return (
    <LocaleProvider translations={dict} locale={lang}>
      <Providers pallette={pallette}>
        <Navbar lang={lang} />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Footer />
      </Providers>
    </LocaleProvider>
  );
}

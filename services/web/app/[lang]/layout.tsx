import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/providers';
import { getDictionary, Locale } from './dictionaries';
import LocaleProvider from '@/providers/locale-provider';
import { getServerPalette } from '@/lib/get-server-pallette';
import { getServerTheme } from '@/lib/get-server-theme';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Viatora',
  description: 'Pass your driving license test',
};

export async function generateStaticParams() {
  return [{ lang: 'pl' }, { lang: 'en' }];
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const lang = (await params).lang as Locale;

  const [dict, pallette, theme] = await Promise.all([
    getDictionary(lang),
    getServerPalette(),
    getServerTheme(),
  ]);

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${pallette} ${theme}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider translations={dict} locale={lang}>
          <Providers pallette={pallette}>
            <Navbar lang={lang} />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            <Footer />
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}

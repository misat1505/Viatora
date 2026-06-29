'use client';

import { Locale } from '@/app/[lang]/dictionaries';
import { useRouter } from 'next/navigation';
import LocaleText from './locale-text';

type LanguageSwitchProps = {
  lang: Locale;
};

const LanguageSwitch = ({ lang }: LanguageSwitchProps) => {
  const router = useRouter();
  const newLang = lang === 'pl' ? 'en' : 'pl';

  function handleLanguageSwitch() {
    const cookieAge = 31536000; // 1 year
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=${cookieAge}`;

    const newPath = window.location.pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPath);
  }

  return (
    <button onClick={handleLanguageSwitch}>
      <LocaleText k="translations.misc.change-language" values={{ lang: newLang }} />
    </button>
  );
};

export default LanguageSwitch;

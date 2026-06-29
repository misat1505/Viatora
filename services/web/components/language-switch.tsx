'use client';

import { useRouter } from 'next/navigation';

type LanguageSwitchProps = {
  lang: string;
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

  return <button onClick={handleLanguageSwitch}>Switch language to {newLang}</button>;
};

export default LanguageSwitch;

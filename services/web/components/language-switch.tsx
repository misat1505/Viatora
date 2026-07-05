'use client';

import { Locale } from '@/app/[lang]/dictionaries';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Flag from 'react-world-flags';

type LanguageSwitchProps = {
  lang: Locale;
};

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: 'pl' as Locale, label: 'Polski', flag: 'pl' },
  { code: 'en' as Locale, label: 'English', flag: 'gb' },
];

const LanguageSwitch = ({ lang }: LanguageSwitchProps) => {
  const router = useRouter();
  const current = languages.find((l) => l.code === lang) ?? languages[0];

  function handleLanguageSwitch(newLang: Locale) {
    if (newLang === lang) return;

    const cookieAge = 31536000; // 1 year
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=${cookieAge}`;

    const newPath = window.location.pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPath);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Flag code={current.flag} width={18} height={13} className="rounded-[2px] object-cover" />
          <span>{current.label}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {languages.map((language) => {
          const active = language.code === lang;
          return (
            <DropdownMenuItem
              key={language.code}
              disabled={active}
              onClick={() => handleLanguageSwitch(language.code)}
              className={cn(
                'flex items-center gap-2',
                active && 'opacity-100 font-medium text-foreground',
              )}
            >
              <Flag
                code={language.flag}
                width={18}
                height={13}
                className="rounded-[2px] object-cover"
              />
              <span className="flex-1">{language.label}</span>
              {active && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitch;

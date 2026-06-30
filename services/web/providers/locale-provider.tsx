'use client';

import { createContext, PropsWithChildren, useContext } from 'react';
import { getDictionary, Locale } from '@/app/[lang]/dictionaries';

type Translation = Awaited<ReturnType<typeof getDictionary>>;

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;
type DotPaths<T> = T extends object
  ? {
      // @ts-expect-error dot string won't be infinite
      [K in keyof T & string]: `${K}${DotPrefix<DotPaths<T[K]>>}`;
    }[keyof T & string]
  : '';

export type TranslationPath = DotPaths<Translation>;
export type TVars = Record<string, string>;
export type TranslateFn = (key: TranslationPath, vars?: TVars) => string;

type LocaleContextProps = {
  locale: string;
  t: TranslateFn;
};

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

export const useLocaleContext = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocaleContext must be used within LocaleProvider');
  return context;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getNested = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

const interpolate = (template: string, vars?: TVars) => {
  if (!vars) return template;
  return template.replace(/{{(.*?)}}/g, (_, key) => vars[key.trim()] || '');
};

type LocaleProviderProps = PropsWithChildren & {
  translations: Translation;
  locale: Locale;
};

export const LocaleProvider = ({ children, translations, locale }: LocaleProviderProps) => {
  const t: TranslateFn = (path, vars) => {
    const value = getNested(translations, path);
    if (typeof value === 'string') return interpolate(value, vars);
    return value;
  };

  return <LocaleContext.Provider value={{ locale, t }}>{children}</LocaleContext.Provider>;
};

export default LocaleProvider;

'use client';

import { getDictionary } from '@/app/[lang]/dictionaries';
import { createContext, PropsWithChildren, useContext } from 'react';

type LocaleContextProps = PropsWithChildren & {
  translations: Awaited<ReturnType<typeof getDictionary>>;
};

type LocaleContextProvidedValues = { translations: Awaited<ReturnType<typeof getDictionary>> };

const LocaleContext = createContext<LocaleContextProvidedValues | undefined>(undefined);

export const useLocaleContext = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) throw new Error('useLocaleContext called outside LocaleProvider.');
  return context;
};

const LocaleProvider = ({ children, translations }: LocaleContextProps) => {
  return <LocaleContext.Provider value={{ translations }}>{children}</LocaleContext.Provider>;
};

export default LocaleProvider;

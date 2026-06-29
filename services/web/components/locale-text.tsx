// components/locale-text.tsx
'use client';

import { useLocaleContext } from '@/providers/locale-provider';

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? `${K}` | `${K}.${NestedKeyOf<T[K]>}` : never }[keyof T]
  : never;

type Translations = ReturnType<typeof useLocaleContext>;
type TranslationKey = NestedKeyOf<Translations>;

function getNestedValue(obj: Translations, path: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return path.split('.').reduce((acc: any, key) => acc?.[key], obj) ?? path;
}

function interpolate(template: string, values?: Record<string, string>): string {
  if (!values) return template;
  return Object.entries(values).reduce(
    (str, [key, value]) => str.replace(new RegExp(`{${key}}`, 'g'), value),
    template,
  );
}

type LocaleTextProps = {
  k: TranslationKey;
  values?: Record<string, string>;
};

const LocaleText = ({ k, values }: LocaleTextProps) => {
  const translations = useLocaleContext();
  const template = getNestedValue(translations, k);
  return <>{interpolate(template, values)}</>;
};

export default LocaleText;

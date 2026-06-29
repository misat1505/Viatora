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

type LocaleTextProps = {
  k: TranslationKey;
};

const LocaleText = ({ k }: LocaleTextProps) => {
  const translations = useLocaleContext();
  return <>{getNestedValue(translations, k)}</>;
};

export default LocaleText;

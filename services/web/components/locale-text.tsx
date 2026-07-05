'use client';

import { TranslationPath, useLocaleContext } from '@/providers/locale-provider';

type LocaleTextProps = {
  k: TranslationPath;
  values?: Record<string, string>;
};

const LocaleText = ({ k, values }: LocaleTextProps) => {
  const { t } = useLocaleContext();
  return <>{t(k, values)}</>;
};

export default LocaleText;

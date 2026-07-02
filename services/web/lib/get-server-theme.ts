import { cookies } from 'next/headers';

type Theme = 'light' | 'dark';

export async function getServerTheme(): Promise<Theme> {
  const cookieStore = await cookies();
  const t = cookieStore.get('theme')?.value;

  return (t as Theme) ?? 'light';
}

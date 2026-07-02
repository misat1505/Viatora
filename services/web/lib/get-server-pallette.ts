import { cookies } from 'next/headers';
import { DEFAULT_PALLETTE, PALLETTES, Pallette } from './pallette-script';

export async function getServerPalette(): Promise<Pallette> {
  const cookieStore = await cookies();
  const p = cookieStore.get('pallette')?.value;

  if (PALLETTES.includes(p as Pallette)) {
    return p as Pallette;
  }

  return DEFAULT_PALLETTE;
}

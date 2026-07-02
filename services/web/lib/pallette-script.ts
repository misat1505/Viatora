export const PALLETTE_STORAGE_KEY = 'pallette';
export const PALLETTES = [
  'caffeine',
  'supabase',
  'vercel',
  'twitter',
  'notebook',
  'claude',
] as const;
export type Pallette = (typeof PALLETTES)[number];
export const DEFAULT_PALLETTE: Pallette = 'caffeine';

export function applyPallette(next: Pallette) {
  document.documentElement.classList.remove(...PALLETTES);
  document.documentElement.classList.add(next);
  try {
    localStorage.setItem(PALLETTE_STORAGE_KEY, next);
  } catch {}
  try {
    document.cookie = `${PALLETTE_STORAGE_KEY}=${next}; path=/; max-age=31536000`;
  } catch {}
}

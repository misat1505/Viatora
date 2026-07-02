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

export function getInitialPallette(): Pallette {
  if (typeof document === 'undefined') return DEFAULT_PALLETTE;
  // czytaj to co REALNIE jest już na <html>, ustawione przez inline-script
  const found = PALLETTES.find((p) => document.documentElement.classList.contains(p));
  return found ?? DEFAULT_PALLETTE;
}

export function applyPallette(next: Pallette) {
  document.documentElement.classList.remove(...PALLETTES);
  document.documentElement.classList.add(next);
  try {
    localStorage.setItem(PALLETTE_STORAGE_KEY, next);
  } catch {}
}

export const palletteInitScript = `
(function() {
  try {
    var palettes = ${JSON.stringify(PALLETTES)};
    var p = localStorage.getItem('${PALLETTE_STORAGE_KEY}') || '${DEFAULT_PALLETTE}';
    document.documentElement.classList.remove.apply(document.documentElement.classList, palettes);
    document.documentElement.classList.add(p);
  } catch (e) {}
})();
`;

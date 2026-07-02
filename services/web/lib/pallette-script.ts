export const PALLETTE_STORAGE_KEY = 'pallette';
export const PALLETTES = ['caffeine', 'supabase'] as const;
export type Pallette = (typeof PALLETTES)[number];
export const DEFAULT_PALLETTE: Pallette = 'caffeine';

export const palletteInitScript = `
(function() {
  try {
    var p = localStorage.getItem('${PALLETTE_STORAGE_KEY}') || '${DEFAULT_PALLETTE}';
    document.documentElement.classList.add(p);
  } catch (e) {}
})();
`;

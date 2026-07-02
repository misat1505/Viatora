'use client';

import * as React from 'react';
import {
  DEFAULT_PALLETTE,
  PALLETTE_STORAGE_KEY,
  PALLETTES,
  type Pallette,
} from '@/lib/pallette-script';

type PalletteContextValue = {
  pallette: Pallette;
  setPallette: (p: Pallette) => void;
};

const PalletteContext = React.createContext<PalletteContextValue | undefined>(undefined);

export function PalletteProvider({ children }: { children: React.ReactNode }) {
  const [pallette, setPalletteState] = React.useState<Pallette>(DEFAULT_PALLETTE);

  React.useEffect(() => {
    const stored = (localStorage.getItem(PALLETTE_STORAGE_KEY) as Pallette) || DEFAULT_PALLETTE;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPalletteState(stored);
  }, []);

  const setPallette = React.useCallback((next: Pallette) => {
    setPalletteState(next);
    localStorage.setItem(PALLETTE_STORAGE_KEY, next);
    document.documentElement.classList.remove(...PALLETTES);
    document.documentElement.classList.add(next);
  }, []);

  return (
    <PalletteContext.Provider value={{ pallette, setPallette }}>
      {children}
    </PalletteContext.Provider>
  );
}

export function usePallette() {
  const ctx = React.useContext(PalletteContext);
  if (!ctx) throw new Error('usePallette must be used within PalletteProvider');
  return ctx;
}

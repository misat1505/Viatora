'use client';

import * as React from 'react';
import { applyPallette, getInitialPallette, type Pallette } from '@/lib/pallette-script';

type PalletteContextValue = {
  pallette: Pallette;
  setPallette: (p: Pallette) => void;
};

const PalletteContext = React.createContext<PalletteContextValue | undefined>(undefined);

export function PalletteProvider({ children }: { children: React.ReactNode }) {
  // lazy init: przy KAŻDYM mount (w tym remount po zmianie [lang])
  // odczytaj to, co faktycznie jest na <html> — nie zgaduj DEFAULT_PALLETTE
  const [pallette, setPalletteState] = React.useState<Pallette>(() => getInitialPallette());

  // useLayoutEffect, nie useEffect — synchronicznie, przed malowaniem,
  // i za KAŻDYM razem gdy komponent (re)montuje się z danym stanem
  React.useLayoutEffect(() => {
    applyPallette(pallette);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // tylko przy mount — zapewnia spójność DOM<->state po ewentualnym remoncie

  const setPallette = React.useCallback((next: Pallette) => {
    setPalletteState(next);
    applyPallette(next);
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

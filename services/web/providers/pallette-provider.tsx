'use client';

import * as React from 'react';
import { applyPallette, type Pallette } from '@/lib/pallette-script';

type PalletteContextValue = {
  pallette: Pallette;
  setPallette: (p: Pallette) => void;
};

const PalletteContext = React.createContext<PalletteContextValue | undefined>(undefined);

export function PalletteProvider({
  children,
  initialPallette,
}: {
  initialPallette: Pallette | null;
  children: React.ReactNode;
}) {
  const [pallette, setPalletteState] = React.useState<Pallette>(initialPallette ?? 'caffeine');

  React.useLayoutEffect(() => {
    applyPallette(pallette);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

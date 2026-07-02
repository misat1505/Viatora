import { PropsWithChildren } from 'react';
import RefreshTokenProvider from './refresh-token-provider';
import { ThemeProvider } from './theme-provider';
import { PalletteProvider } from './pallette-provider';
import { Pallette } from '@/lib/pallette-script';

type ProvidersProps = PropsWithChildren & {
  pallette: Pallette;
  theme: 'light' | 'dark';
};

const Providers = ({ children, pallette, theme }: ProvidersProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme={theme} disableTransitionOnChange>
      <PalletteProvider initialPallette={pallette}>
        <RefreshTokenProvider>{children}</RefreshTokenProvider>
      </PalletteProvider>
    </ThemeProvider>
  );
};

export default Providers;

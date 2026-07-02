import { PropsWithChildren } from 'react';
import RefreshTokenProvider from './refresh-token-provider';
import { ThemeProvider } from './theme-provider';
import { PalletteProvider } from './pallette-provider';
import { Pallette } from '@/lib/pallette-script';

type ProvidersProps = PropsWithChildren & {
  pallette: Pallette;
};

const Providers = ({ children, pallette }: ProvidersProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <PalletteProvider initialPallette={pallette}>
        <RefreshTokenProvider>{children}</RefreshTokenProvider>
      </PalletteProvider>
    </ThemeProvider>
  );
};

export default Providers;

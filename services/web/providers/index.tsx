import { PropsWithChildren } from 'react';
import RefreshTokenProvider from './refresh-token-provider';
import { ThemeProvider } from './theme-provider';
import { PalletteProvider } from './pallette-provider';

type ProvidersProps = PropsWithChildren;

const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <PalletteProvider>
        <RefreshTokenProvider>{children}</RefreshTokenProvider>
      </PalletteProvider>
    </ThemeProvider>
  );
};

export default Providers;

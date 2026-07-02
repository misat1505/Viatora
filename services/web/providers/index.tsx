import { PropsWithChildren } from 'react';
import RefreshTokenProvider from './refresh-token-provider';
import { ThemeProvider } from './theme-provider';

type ProvidersProps = PropsWithChildren;

const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <RefreshTokenProvider>{children}</RefreshTokenProvider>
    </ThemeProvider>
  );
};

export default Providers;

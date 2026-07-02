import { PropsWithChildren } from 'react';
import RefreshTokenProvider from './refresh-token-provider';
import { PalletteProvider } from './pallette-provider';
import { Pallette } from '@/lib/pallette-script';

type ProvidersProps = PropsWithChildren & {
  pallette: Pallette;
};

const Providers = ({ children, pallette }: ProvidersProps) => {
  return (
    <PalletteProvider initialPallette={pallette}>
      <RefreshTokenProvider>{children}</RefreshTokenProvider>
    </PalletteProvider>
  );
};

export default Providers;

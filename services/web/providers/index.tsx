import { PropsWithChildren } from 'react';
import RefreshTokenProvider from './refresh-token-provider';

type ProvidersProps = PropsWithChildren;

const Providers = ({ children }: ProvidersProps) => {
  return <RefreshTokenProvider>{children}</RefreshTokenProvider>;
};

export default Providers;

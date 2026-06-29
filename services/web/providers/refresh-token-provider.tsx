'use client';

import axios from 'axios';
import { createContext, PropsWithChildren, useContext, useEffect } from 'react';

type RefreshTokenContextProps = PropsWithChildren & {};

type RefreshTokenContextProvidedValues = object;

const RefreshTokenContext = createContext<RefreshTokenContextProvidedValues | undefined>(undefined);

export const useRefreshTokenContext = () => {
  const context = useContext(RefreshTokenContext);
  if (context === undefined)
    throw new Error('useRefreshTokenContext called outside RefreshTokenProvider.');
  return context;
};

const RefreshTokenProvider = ({ children }: RefreshTokenContextProps) => {
  useEffect(() => {
    async function refreshToken() {
      await axios.post('/auth/refresh');
    }

    const delay = 1000 * 60 * 10;

    const intervalId = setInterval(refreshToken, delay);

    return () => clearInterval(intervalId);
  }, []);

  return <RefreshTokenContext.Provider value={{}}>{children}</RefreshTokenContext.Provider>;
};

export default RefreshTokenProvider;

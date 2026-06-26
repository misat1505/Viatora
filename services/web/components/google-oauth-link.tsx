'use client';

import Link from 'next/link';
import { PropsWithChildren } from 'react';

type GoogleOAuthLinkProps = PropsWithChildren & {
  redirect?: 'self' | string;
};

const GoogleOAuthLink = ({ redirect = 'self', children }: GoogleOAuthLinkProps) => {
  const redirectPath =
    redirect === 'self' ? window.location.pathname + window.location.search : redirect;

  return <Link href={`/auth/google?redirect=${encodeURIComponent(redirectPath)}`}>{children}</Link>;
};

export default GoogleOAuthLink;

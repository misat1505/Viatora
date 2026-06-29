'use client';

import Link from 'next/link';
import { PropsWithChildren } from 'react';
import { buttonVariants } from './ui/button';
import Image from 'next/image';
import GOOGLE_LOGO from '@/assets/google-logo.webp';

type GoogleOAuthLinkProps = PropsWithChildren & {
  redirect?: 'self' | string;
};

const GoogleOAuthLink = ({ redirect = 'self', children }: GoogleOAuthLinkProps) => {
  const redirectPath =
    redirect === 'self' ? window.location.pathname + window.location.search : redirect;

  return (
    <Link
      className={buttonVariants({
        variant: 'outline',
        className: 'h-fit w-fit text-lg py-4 border! border-mist-600/50!',
      })}
      href={`/api/auth/google?redirect=${encodeURIComponent(redirectPath)}`}
    >
      <Image src={GOOGLE_LOGO} alt="Google logo" width={32} height={32} />
      {children}
    </Link>
  );
};

export default GoogleOAuthLink;

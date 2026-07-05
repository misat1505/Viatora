'use client';

import Link from 'next/link';
import { PropsWithChildren } from 'react';
import { buttonVariants } from './ui/button';
import Image from 'next/image';
import GOOGLE_LOGO from '@/assets/google-logo.webp';
import { cn } from '@/lib/utils';

type GoogleOAuthLinkProps = PropsWithChildren & {
  redirect?: 'self' | string;
  className?: string;
};

const GoogleOAuthLink = ({ redirect = 'self', children, className }: GoogleOAuthLinkProps) => {
  const redirectPath =
    redirect === 'self' ? window.location.pathname + window.location.search : redirect;

  return (
    <Link
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'h-11 w-full gap-3 text-sm font-medium',
        className,
      )}
      href={`/api/auth/google?redirect=${encodeURIComponent(redirectPath)}`}
    >
      <Image src={GOOGLE_LOGO} alt="" width={18} height={18} />
      {children}
    </Link>
  );
};

export default GoogleOAuthLink;

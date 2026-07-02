'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export function LocalizedLink(props: React.ComponentProps<typeof Link>) {
  const params = useParams();
  const lang = params.lang as string;

  const href = typeof props.href === 'string' ? `/${lang}${props.href}` : props.href;

  return <Link {...props} href={href} />;
}

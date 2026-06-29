import GoogleOAuthLink from '@/components/google-oauth-link';
import { getDictionary, hasLocale } from '../dictionaries';
import { notFound } from 'next/navigation';

const RegisterPage = async ({ params }: { params: Promise<{ lang: string }> }) => {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <GoogleOAuthLink redirect="/dashboard">{dict.register.registerWithGoogle}</GoogleOAuthLink>
  );
};

export default RegisterPage;

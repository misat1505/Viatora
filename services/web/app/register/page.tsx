'use client';

import GoogleOAuthLink from '@/components/google-oauth-link';

const RegisterPage = () => {
  return <GoogleOAuthLink redirect="/dashboard">login with google</GoogleOAuthLink>;
};

export default RegisterPage;

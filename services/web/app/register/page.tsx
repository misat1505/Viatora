'use client';

import { registerUser } from '@/actions/register-user';
import Link from 'next/link';

const RegisterPage = () => {
  async function handleRegister() {
    const url = await registerUser();
    window.location.href = url;
  }

  return (
    <>
      {/* <Link href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}>login with google</Link> */}
      <button onClick={handleRegister}>Login with google</button>
    </>
  );
};

export default RegisterPage;

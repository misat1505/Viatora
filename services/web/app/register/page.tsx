import Link from 'next/link';

const RegisterPage = () => {
  return <Link href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}>Login with google</Link>;
};

export default RegisterPage;

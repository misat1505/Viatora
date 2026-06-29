'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';

type LogoutButtonProps = PropsWithChildren;

const LogoutButton = ({ children }: LogoutButtonProps) => {
  const router = useRouter();

  async function handleLogout() {
    await axios.post('/api/auth/logout');
    router.refresh();
  }

  return <button onClick={handleLogout}>{children}</button>;
};

export default LogoutButton;

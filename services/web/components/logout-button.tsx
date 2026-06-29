'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { Button } from './ui/button';

type LogoutButtonProps = PropsWithChildren;

const LogoutButton = ({ children }: LogoutButtonProps) => {
  const router = useRouter();

  async function handleLogout() {
    await axios.post('/api/auth/logout');
    router.refresh();
  }

  return (
    <Button variant="destructive" onClick={handleLogout}>
      {children}
    </Button>
  );
};

export default LogoutButton;

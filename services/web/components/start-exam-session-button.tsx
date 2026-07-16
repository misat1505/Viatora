'use client';

import { startExamSession } from '@/actions/exams/start-exam-session';
import { Button } from './ui/button';
import { useParams, useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';

type StartExamSessionButtonProps = PropsWithChildren & { category: string; className?: string };

const StartExamSessionButton = ({ category, children, className }: StartExamSessionButtonProps) => {
  const { lang } = useParams();
  const router = useRouter();

  async function handleClick() {
    const [error, exam] = await startExamSession(category);
    // TODO: do sth about this, some toast
    if (error) throw error;
    router.push(`/${lang}/exams/${exam.sessionId}`);
  }

  return (
    <Button onClick={handleClick} className={className}>
      {children}
    </Button>
  );
};

export default StartExamSessionButton;

'use client';

import { startExamSession } from '@/actions/exams/start-exam-session';
import { Button } from './ui/button';
import { useParams, useRouter } from 'next/navigation';

type StartExamSessionButtonProps = { category: string };

const StartExamSessionButton = ({ category }: StartExamSessionButtonProps) => {
  const { lang } = useParams();
  const router = useRouter();

  async function handleClick() {
    const exam = await startExamSession(category);
    router.push(`/${lang}/exams/${exam.sessionId}`);
  }

  return <Button onClick={handleClick}>Rozpocznij egzamin na kategorie {category}</Button>;
};

export default StartExamSessionButton;

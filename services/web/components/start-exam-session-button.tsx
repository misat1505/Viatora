'use client';

import { startExamSession } from '@/actions/exams/start-exam-session';
import { Button } from './ui/button';

type StartExamSessionButtonProps = { category: string };

const StartExamSessionButton = ({ category }: StartExamSessionButtonProps) => {
  async function handleClick() {
    await startExamSession(category);
  }

  return <Button onClick={handleClick}>Rozpocznij egzamin na kategorie {category}</Button>;
};

export default StartExamSessionButton;

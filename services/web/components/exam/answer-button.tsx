'use client';

import { answerQuestion } from '@/actions/exams/answer-question';
import { ExamSessionDTO } from '@/generated/viatoraAPI.schemas';
import { useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';

type AnswerButtonProps = PropsWithChildren & {
  label: 'a' | 'b' | 'c';
  isCorrect: boolean;
  isSelected: boolean;
  examId: ExamSessionDTO['sessionId'];
  questionId: ExamSessionDTO['currentQuestionId'];
};

const AnswerButton = ({
  isCorrect,
  label,
  isSelected,
  examId,
  questionId,
  children,
}: AnswerButtonProps) => {
  const router = useRouter();

  async function handleClick() {
    await answerQuestion(examId, { questionId, userAnswer: label });
    router.refresh();
  }

  function getClassNames() {
    if (!isSelected) return '';
    if (isCorrect) return 'border-primary/50 bg-primary/10 text-primary';
    return 'border-destructive/50 bg-destructive/10 text-destructive';
  }

  return (
    <button
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors w-full hover:cursor-pointer ${getClassNames()}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default AnswerButton;

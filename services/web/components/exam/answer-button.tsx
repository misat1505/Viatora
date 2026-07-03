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
    console.log({ examId, questionId, label });
    const result = await answerQuestion(examId, { questionId, userAnswer: label });
    console.log(result);
    router.refresh();
  }

  return (
    <button
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors w-full hover:cursor-pointer ${
        isCorrect
          ? 'border-primary/50 bg-primary/10 text-primary'
          : isSelected
            ? 'border-destructive/50 bg-destructive/10 text-destructive'
            : 'border-border text-card-foreground'
      }`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default AnswerButton;

import { ExamQuestion } from 'src/generated/content';

export function shuffleQuestions(questions: ExamQuestion[]): ExamQuestion[] {
  const basic: ExamQuestion[] = [];
  const specialist: ExamQuestion[] = [];

  for (const q of questions) {
    if (q.questionType === 'basic') {
      basic.push(q);
    } else if (q.questionType === 'specialist') {
      specialist.push(q);
    }
  }

  const shuffleArray = <T>(arr: T[]): T[] => {
    const copy = [...arr];

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  };

  return [...shuffleArray(basic), ...shuffleArray(specialist)];
}

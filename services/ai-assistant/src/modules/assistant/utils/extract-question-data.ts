import { DetailedExamQuestion, Locale } from 'src/generated/content';

export type SupportedLocale = keyof Locale; // 'pl' | 'en'

export function extractQuestionData(
  question: DetailedExamQuestion,
  locale: SupportedLocale,
): {
  questionContent: string;
  questionOptions: string[];
  correctAnswer: string;
} {
  if (!question.text || !question.answers) {
    throw new Error('Question is missing text or answers');
  }

  const { a, b, c, correctAnswer } = question.answers;

  const options: { key: 'a' | 'b' | 'c'; locale: Locale | undefined }[] = [
    { key: 'a', locale: a },
    { key: 'b', locale: b },
    { key: 'c', locale: c },
  ];

  const questionOptions = options
    .filter((opt) => opt.locale !== undefined)
    .map((opt) => opt.locale![locale]);

  const correctAnswerOption = options.find((opt) => opt.key === correctAnswer);

  if (!correctAnswerOption?.locale) {
    throw new Error('Correct answer option not found in question data');
  }

  return {
    questionContent: question.text[locale],
    questionOptions,
    correctAnswer: correctAnswerOption.locale[locale],
  };
}

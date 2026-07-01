type Category = 'B' | 'A' | 'A1' | 'A2' | 'B1' | 'C' | 'D' | 'AM';

enum QuestionType {
  BASIC = 'basic',
  SPECIALIST = 'specialist',
}

type QuestionTypeConfig = {
  questionType: QuestionType;
  points: number;
  count: number;
};

const defaultCategoryConfig: QuestionTypeConfig[] = [
  // TODO: uncomment that, but for now to reduce sanity calls we will have just 1 request

  // {
  //     questionType: QuestionType.BASIC,
  //     points: 3,
  //     count: 10,
  //   },
  //   {
  //     questionType: QuestionType.BASIC,
  //     points: 2,
  //     count: 6,
  //   },
  //   {
  //     questionType: QuestionType.BASIC,
  //     points: 1,
  //     count: 4,
  //   },
  {
    questionType: QuestionType.SPECIALIST,
    points: 3,
    count: 6,
  },
  // {
  //   questionType: QuestionType.SPECIALIST,
  //   points: 2,
  //   count: 4,
  // },
  // {
  //   questionType: QuestionType.SPECIALIST,
  //   points: 1,
  //   count: 2,
  // },
];

export const EXAMS_CONFIG: Record<Category, QuestionTypeConfig[]> = {
  // all categories have the same exam structure so we can have a default,
  // if that is not the case we can just override the default
  B: defaultCategoryConfig,
  A: defaultCategoryConfig,
  A1: defaultCategoryConfig,
  A2: defaultCategoryConfig,
  B1: defaultCategoryConfig,
  C: defaultCategoryConfig,
  D: defaultCategoryConfig,
  AM: defaultCategoryConfig,
} as const;

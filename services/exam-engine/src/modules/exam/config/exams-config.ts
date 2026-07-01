type Category = 'B';

enum QuestionType {
  BASIC = 'basic',
  SPECIALIST = 'specialist',
}

type QuestionTypeConfig = {
  questionType: QuestionType;
  points: number;
  count: number;
};

export const EXAMS_CONFIG: Record<Category, QuestionTypeConfig[]> = {
  B: [
    // TODO: uncomment that, but for now to reduce sanity calls we will have just 1 request

    // {
    //   questionType: QuestionType.BASIC,
    //   points: 3,
    //   count: 10,
    // },
    // {
    //   questionType: QuestionType.BASIC,
    //   points: 2,
    //   count: 6,
    // },
    // {
    //   questionType: QuestionType.BASIC,
    //   points: 1,
    //   count: 4,
    // },
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
  ],
} as const;

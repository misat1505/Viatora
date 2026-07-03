type Category = 'B' | 'A' | 'A1' | 'A2' | 'B1' | 'C' | 'D' | 'AM';

export enum QuestionType {
  BASIC = 'basic',
  SPECIALIST = 'specialist',
}

type QuestionTypeConfig = {
  questionType: QuestionType;
  points: number;
  count: number;
};

type ExamConfig = {
  totalQuestions: number;
  duration: number;
  questionsConfigs: QuestionTypeConfig[];
};

const defaultCategoryConfig: ExamConfig = {
  totalQuestions: 32,
  duration: 1500, // 25 min
  questionsConfigs: [
    {
      questionType: QuestionType.BASIC,
      points: 3,
      count: 10,
    },
    {
      questionType: QuestionType.BASIC,
      points: 2,
      count: 6,
    },
    {
      questionType: QuestionType.BASIC,
      points: 1,
      count: 4,
    },
    {
      questionType: QuestionType.SPECIALIST,
      points: 3,
      count: 6,
    },
    {
      questionType: QuestionType.SPECIALIST,
      points: 2,
      count: 4,
    },
    {
      questionType: QuestionType.SPECIALIST,
      points: 1,
      count: 2,
    },
  ],
};

export const DEFAULT_EXAMS_CONFIGS_TOKEN = Symbol(
  'DEFAULT_EXAMS_CONFIGS_TOKEN',
);

export type ExamsConfigurations = Record<Category, ExamConfig>;

export const EXAMS_CONFIG: ExamsConfigurations = {
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

import { DetailedExamQuestion, ExamQuestion } from 'src/generated/content';
import { parseMedia } from './parse-media';

export function parseQuestion(question: any): ExamQuestion {
  return {
    id: question._id,
    categories: question.categories,
    slug: question.slug.current,
    points: question.points,
    media: parseMedia(question.media),
    answers: { ...question.options, correctAnswer: question.correctOption },
    questionType: question.questionType,
    tags: question.tags,
    text: question.text,
  };
}

export function parseDetailedQuestion(question: any): DetailedExamQuestion {
  return { ...parseQuestion(question), explanation: question.explanation };
}

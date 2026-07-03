import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shuffleQuestions } from './shuffle-questions';
import { ExamQuestion } from 'src/generated/content';

const createQuestion = (
  id: string,
  type: 'basic' | 'specialist',
): ExamQuestion => ({
  id,
  slug: `slug-${id}`,
  questionType: type,
  categories: [],
  text: undefined,
  answers: undefined,
  points: 1,
  tags: [],
  media: undefined,
});

describe('shuffleQuestions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ─────────────────────────────
  // 1. BASIC BEFORE SPECIALIST
  // ─────────────────────────────
  it('should always return basic questions before specialist', () => {
    const result = shuffleQuestions([
      createQuestion('s1', 'specialist'),
      createQuestion('b1', 'basic'),
      createQuestion('s2', 'specialist'),
      createQuestion('b2', 'basic'),
    ]);

    const firstSpecialistIndex = result.findIndex(
      (q) => q.questionType === 'specialist',
    );

    const lastBasicIndex = result
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => q.questionType === 'basic')
      .map(({ i }) => i)
      .at(-1)!;

    expect(lastBasicIndex).toBeLessThan(firstSpecialistIndex);
  });

  // ─────────────────────────────
  // 2. PRESERVES ALL ITEMS
  // ─────────────────────────────
  it('should not lose or add questions', () => {
    const input = [
      createQuestion('b1', 'basic'),
      createQuestion('b2', 'basic'),
      createQuestion('s1', 'specialist'),
    ];

    const result = shuffleQuestions(input);

    expect(result).toHaveLength(input.length);
    expect(result.map((q) => q.id).sort()).toEqual(
      input.map((q) => q.id).sort(),
    );
  });

  // ─────────────────────────────
  // 3. SPLITS CORRECTLY
  // ─────────────────────────────
  it('should separate basic and specialist correctly', () => {
    const result = shuffleQuestions([
      createQuestion('b1', 'basic'),
      createQuestion('s1', 'specialist'),
    ]);

    expect(result.filter((q) => q.questionType === 'basic')).toHaveLength(1);
    expect(result.filter((q) => q.questionType === 'specialist')).toHaveLength(
      1,
    );
  });

  // ─────────────────────────────
  // 4. EMPTY INPUT
  // ─────────────────────────────
  it('should handle empty array', () => {
    expect(shuffleQuestions([])).toEqual([]);
  });

  // ─────────────────────────────
  // 5. ONLY BASIC OR ONLY SPECIALIST
  // ─────────────────────────────
  it('should handle only basic questions', () => {
    const input = [
      createQuestion('b1', 'basic'),
      createQuestion('b2', 'basic'),
    ];

    const result = shuffleQuestions(input);

    expect(result.every((q) => q.questionType === 'basic')).toBe(true);
  });

  it('should handle only specialist questions', () => {
    const input = [
      createQuestion('s1', 'specialist'),
      createQuestion('s2', 'specialist'),
    ];

    const result = shuffleQuestions(input);

    expect(result.every((q) => q.questionType === 'specialist')).toBe(true);
  });

  // ─────────────────────────────
  // 6. DETERMINISTIC SHUFFLE TEST (optional but powerful)
  // ─────────────────────────────
  it('should shuffle deterministically when Math.random is mocked', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.4);

    const input = [
      createQuestion('b1', 'basic'),
      createQuestion('b2', 'basic'),
      createQuestion('b3', 'basic'),
    ];

    const result = shuffleQuestions(input);

    expect(result.map((q) => q.id)).not.toEqual(input.map((q) => q.id));
  });
});

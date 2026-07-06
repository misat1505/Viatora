import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExamAnswerRepository } from './exam-answer.repository';
import { ExamAnswerEntity } from './entities/exam-answer.entity';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ExamAnswerRepository', () => {
  let repository: ExamAnswerRepository;

  const typeormRepoMock = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ExamAnswerRepository,
        {
          provide: getRepositoryToken(ExamAnswerEntity),
          useValue: typeormRepoMock,
        },
      ],
    }).compile();

    repository = moduleRef.get(ExamAnswerRepository);

    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // create
  // ─────────────────────────────────────────────

  it('should call repo.create with correct data', () => {
    const data = {
      id: 'a1',
      session_id: 'sess_1',
      question_id: 'q1',
    };

    const created = { ...data };

    typeormRepoMock.create.mockReturnValue(created);

    const result = repository.create(data);

    expect(typeormRepoMock.create).toHaveBeenCalledWith(data);
    expect(result).toEqual(created);
  });

  // ─────────────────────────────────────────────
  // saveMany
  // ─────────────────────────────────────────────

  it('should call repo.save with array of answers', async () => {
    const answers = [
      {
        id: 'a1',
        session_id: 'sess_1',
      },
      {
        id: 'a2',
        session_id: 'sess_1',
      },
    ];

    const saved = [
      {
        id: 'a1',
        session_id: 'sess_1',
      },
      {
        id: 'a2',
        session_id: 'sess_1',
      },
    ];

    typeormRepoMock.save.mockResolvedValue(saved);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await repository.saveMany(answers as any);

    expect(typeormRepoMock.save).toHaveBeenCalledWith(answers);
    expect(result).toEqual(saved);
  });

  // ─────────────────────────────────────────────
  // findBySession
  // ─────────────────────────────────────────────

  it('should call repo.find with correct where clause', async () => {
    const answers = [{ id: 'a1', session_id: 'sess_1' }];

    typeormRepoMock.find.mockResolvedValue(answers);

    const result = await repository.findBySession('sess_1');

    expect(typeormRepoMock.find).toHaveBeenCalledWith({
      where: { session_id: 'sess_1' },
    });

    expect(result).toEqual(answers);
  });
});

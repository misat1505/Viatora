import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExamResultRepository } from './exam-result.repository';
import { ExamResultEntity } from './entities/exam-result.entity';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ExamResultRepository', () => {
  let repository: ExamResultRepository;

  const typeormRepoMock = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ExamResultRepository,
        {
          provide: getRepositoryToken(ExamResultEntity),
          useValue: typeormRepoMock,
        },
      ],
    }).compile();

    repository = moduleRef.get(ExamResultRepository);

    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // findBySessionAndUser
  // ─────────────────────────────────────────────

  it('should call repo.findOne with correct where clause', async () => {
    const entity = {
      id: 'sess_1',
      user_id: 'user-1',
    };

    typeormRepoMock.findOne.mockResolvedValue(entity);

    const result = await repository.findBySessionAndUser('sess_1', 'user-1');

    expect(typeormRepoMock.findOne).toHaveBeenCalledWith({
      where: {
        id: 'sess_1',
        user_id: 'user-1',
      },
    });

    expect(result).toEqual(entity);
  });

  // ─────────────────────────────────────────────
  // create
  // ─────────────────────────────────────────────

  it('should call repo.create and return entity', () => {
    const data = {
      id: 'sess_1',
      user_id: 'user-1',
    };

    const created = { ...data };

    typeormRepoMock.create.mockReturnValue(created);

    const result = repository.create(data);

    expect(typeormRepoMock.create).toHaveBeenCalledWith(data);
    expect(result).toEqual(created);
  });

  // ─────────────────────────────────────────────
  // save
  // ─────────────────────────────────────────────

  it('should call repo.save and return saved entity', async () => {
    const entity = {
      id: 'sess_1',
      user_id: 'user-1',
    };

    const saved = {
      ...entity,
      status: 'COMPLETED',
    };

    typeormRepoMock.save.mockResolvedValue(saved);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await repository.save(entity as any);

    expect(typeormRepoMock.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(saved);
  });

  it('should call repo.find with correct user_id and ordering', async () => {
    const entities = [
      { id: 'sess_1', user_id: 'user-1', completed_at: new Date() },
    ];

    typeormRepoMock.find.mockResolvedValue(entities);

    const result = await repository.findByUserId('user-1');

    expect(typeormRepoMock.find).toHaveBeenCalledWith({
      where: {
        user_id: 'user-1',
      },
      order: {
        completed_at: 'DESC',
      },
    });

    expect(result).toEqual(entities);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { KafkaProducerService } from './kafka-producer.service';
import { KAFKA_SERVICE_TOKEN } from './kafka.token';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('KafkaProducerService', () => {
  let service: KafkaProducerService;
  let kafkaClient: {
    connect: ReturnType<typeof vi.fn>;
    emit: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    kafkaClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      emit: vi.fn().mockReturnValue(of(undefined)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaProducerService,
        {
          provide: KAFKA_SERVICE_TOKEN,
          useValue: kafkaClient,
        },
      ],
    }).compile();

    service = module.get<KafkaProducerService>(KafkaProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect kafka client', async () => {
      await service.onModuleInit();

      expect(kafkaClient.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('produce', () => {
    it('should emit message to kafka topic', async () => {
      const topic = 'user.created' as any;
      const payload = {
        id: '123',
        name: 'John',
      };

      await service.produce(topic, payload);

      expect(kafkaClient.emit).toHaveBeenCalledWith(topic, payload);
    });

    it('should resolve when kafka emit completes', async () => {
      const topic = 'user.created' as any;
      const payload = {
        id: '123',
      };

      await expect(service.produce(topic, payload)).resolves.toBeUndefined();

      expect(kafkaClient.emit).toHaveBeenCalledTimes(1);
    });

    it('should propagate kafka errors', async () => {
      const error = new Error('Kafka unavailable');

      kafkaClient.emit.mockReturnValue(throwError(() => error));

      await expect(service.produce('user.created' as any, {})).rejects.toThrow(
        'Kafka unavailable',
      );
    });
  });
});

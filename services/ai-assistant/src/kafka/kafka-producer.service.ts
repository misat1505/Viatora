import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaPayload, KafkaTopic } from './types/topics';
import { firstValueFrom } from 'rxjs';
import { KAFKA_SERVICE_TOKEN } from './kafka.token';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE_TOKEN)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async produce<T extends KafkaTopic>(topic: T, data: KafkaPayload<T>) {
    await firstValueFrom(this.kafkaClient.emit(topic, data));
  }
}

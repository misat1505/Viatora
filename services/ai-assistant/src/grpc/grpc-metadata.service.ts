import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class GrpcMetadataService {
  private readonly meta: Metadata;

  constructor(config: ConfigService) {
    this.meta = new Metadata();
    this.meta.add('x-service-key', config.getOrThrow('SERVICE_KEY'));
  }

  get authMeta(): Metadata {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.meta.clone();
  }
}

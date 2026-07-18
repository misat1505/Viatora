import { Inject, Injectable, OnModuleInit, Type } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { GrpcMetadataService } from '../grpc-metadata.service';
import { wrapGrpcService } from './wrap-grpc-service';
import { PromisifiedGrpcClient } from '../types/grpc-client';

export interface GrpcClientWrapper<T> {
  service: PromisifiedGrpcClient<T>;
}

export function createGrpcClientProvider<T extends Record<string, any>>(
  packageToken: string | symbol,
  serviceName: string,
): Type<GrpcClientWrapper<T>> {
  @Injectable()
  class GrpcClientService implements OnModuleInit, GrpcClientWrapper<T> {
    service!: PromisifiedGrpcClient<T>;

    constructor(
      @Inject(packageToken) private readonly grpcClient: ClientGrpc,
      private readonly grpcMetadataService: GrpcMetadataService,
    ) {}

    onModuleInit() {
      const raw = this.grpcClient.getService<T>(serviceName);
      this.service = wrapGrpcService(raw, this.grpcMetadataService);
    }
  }

  return GrpcClientService;
}

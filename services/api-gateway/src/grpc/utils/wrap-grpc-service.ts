import { firstValueFrom, Observable } from 'rxjs';
import { GrpcMetadataService } from '../grpc-metadata.service';
import { PromisifiedGrpcClient } from '../types/grpc-client';

export function wrapGrpcService<T extends Record<string, any>>(
  rawService: T,
  grpcMetadataService: GrpcMetadataService,
): PromisifiedGrpcClient<T> {
  return new Proxy(rawService, {
    get(target, prop: string) {
      const original = target[prop];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (typeof original !== 'function') return original;

      return (request: unknown) => {
        const result = original.call(
          target,
          request,
          grpcMetadataService.authMeta,
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result instanceof Observable ? firstValueFrom(result) : result;
      };
    },
  });
}

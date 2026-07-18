// src/grpc/types/grpc-client.ts
import { Observable } from 'rxjs';

type ExtractGrpcOverload<F> = F extends {
  (request: infer Req): Observable<infer Res>;
  (request: any, metadata?: any, options?: any): Observable<infer Res>;
  (request: any, callback: any): any;
  (request: any, metadata: any, options: any, callback: any): any;
}
  ? { request: Req; response: Res }
  : never;

export type PromisifiedGrpcClient<T> = {
  [K in keyof T]: ExtractGrpcOverload<T[K]> extends {
    request: infer Req;
    response: infer Res;
  }
    ? (request: Req) => Promise<Res>
    : T[K];
};

export type GrpcResponse<T, K extends keyof T> =
  ExtractGrpcOverload<T[K]> extends { response: infer Res } ? Res : never;

export type GrpcRequest<T, K extends keyof T> =
  ExtractGrpcOverload<T[K]> extends { request: infer Req } ? Req : never;

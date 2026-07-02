import {
  CanActivate,
  ExecutionContext,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServiceKeyGuard implements CanActivate, OnModuleInit {
  private expectedServiceKey!: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.expectedServiceKey =
      this.configService.getOrThrow<string>('SERVICE_KEY');
  }

  canActivate(context: ExecutionContext): boolean {
    const rpc = context.switchToRpc();
    const metadata: Metadata = rpc.getContext();

    const serviceKey = metadata.get('x-service-key')?.[0];

    return serviceKey === this.expectedServiceKey;
  }
}

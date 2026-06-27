import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AUTH_PACKAGE } from '../../grpc/clients.module';
import { AuthServiceClient } from 'src/generated/auth';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { createHash } from 'crypto';

@Injectable()
export class JwtAuthGuard implements CanActivate, OnModuleInit {
  private authService!: AuthServiceClient;

  constructor(
    @Inject(AUTH_PACKAGE) private readonly grpcClient: ClientGrpc,
    private readonly grpcMetadataService: GrpcMetadataService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  onModuleInit() {
    this.authService =
      this.grpcClient.getService<AuthServiceClient>('AuthService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException('Missing token');

    const tokenHash = createHash('sha256').update(token).digest('hex');

    // Try cache first (api-gateway:token:cache:{tokenHash} — we cache by token hash)
    const cacheKey = `api-gateway:token:cache:${tokenHash}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      request.user = JSON.parse(cached as string);
      return true;
    }

    const result = await firstValueFrom(
      this.authService.validateToken(
        { token },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    ).catch(() => null);

    if (!result?.valid) throw new UnauthorizedException('Invalid token');

    const user = {
      userId: result.userId,
      email: result.email,
      // plan: result.plan,
      jti: result.jti,
    };

    await this.cache.set(cacheKey, JSON.stringify(user));
    request.user = user;
    return true;
  }

  private extractToken(request: any): string | null {
    const auth: string = request.headers?.authorization ?? '';
    if (!auth.startsWith('Bearer ')) return null;
    return auth.slice(7);
  }
}

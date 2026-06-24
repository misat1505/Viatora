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
// import { REDIS_CLIENT } from '../../redis/redis.module';

@Injectable()
export class JwtAuthGuard implements CanActivate, OnModuleInit {
  private authService!: AuthServiceClient;

  constructor(
    @Inject(AUTH_PACKAGE) private readonly grpcClient: ClientGrpc,
    // @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  onModuleInit() {
    this.authService =
      this.grpcClient.getService<AuthServiceClient>('AuthService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException('Missing token');

    // Try cache first (token:cache:{jti} — we cache by raw token here pre-decode)
    // const cacheKey = `token:cache:${token}`;
    // const cached = await this.redis.get(cacheKey);
    // if (cached) {
    //   request.user = JSON.parse(cached);
    //   return true;
    // }

    const result = await firstValueFrom(
      this.authService.validateToken({ token }),
    ).catch(() => null);

    if (!result?.valid) throw new UnauthorizedException('Invalid token');

    const user = {
      userId: result.userId,
      email: result.email,
      // plan: result.plan,
      jti: result.jti,
    };

    // await this.redis.set(cacheKey, JSON.stringify(user), 'EX', 300); // 5 min
    request.user = user;
    return true;
  }

  private extractToken(request: any): string | null {
    const auth: string = request.headers?.authorization ?? '';
    if (!auth.startsWith('Bearer ')) return null;
    return auth.slice(7);
  }
}

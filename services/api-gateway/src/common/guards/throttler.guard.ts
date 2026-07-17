import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { Request } from 'express';
import Redis from 'ioredis';

@Injectable()
export class ThrottlerGuard implements CanActivate {
  prefix = 'api-gateway:throttler:ip';
  windowSeconds = 60;
  maxRequests = 10;

  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { ip } = context.switchToHttp().getRequest<Request>();
    if (!ip) return false;

    const ipHash = createHash('sha256').update(ip).digest('hex');

    const redisKey = `${this.prefix}:${ipHash}`;

    const now = Date.now();
    const windowStart = now - this.windowSeconds * 1000;

    await this.redis.zremrangebyscore(redisKey, 0, windowStart);

    const count = await this.redis.zcard(redisKey);
    if (count >= this.maxRequests) return false;

    await this.redis.zadd(redisKey, now, `${now}:${Math.random()}`);

    return true;
  }
}

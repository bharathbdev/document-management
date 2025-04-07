import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}

  async set(key: number, value: any): Promise<void> {
    await this.cacheService.set(key.toString(), value);
  }

  async get(key: number): Promise<any> {
    const value = await this.cacheService.get(key.toString());
    return value;
  }

  async del(key: string): Promise<void> {
    await this.cacheService.del(key.toString());
  }
}

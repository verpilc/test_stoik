import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Nullable } from '../types/common.types';
import { HashUtils } from '../utils/hash.utils';

@Injectable()
export class ShortenerService {
  constructor(private readonly redisService: RedisService) {}

  async getUrl(hash: string): Promise<Nullable<string>> {
    const tinyUrl: Nullable<string> = await this.redisService.getTinyUrl(hash);
    return tinyUrl;
  }

  async createTinyUrl(url: string): Promise<string> {
    const hash: string = HashUtils.createHash(url);
    await this.redisService.createTinyUrl(hash, url);
    return hash;
  }
}

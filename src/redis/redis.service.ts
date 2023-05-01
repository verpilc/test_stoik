import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';
import { SECONDS_IN_ONE_DAY, TTL_IN_DAY } from './redis.constants';
import { Nullable } from '../types/common.types';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient();
    await this.start();
  }

  async onModuleDestroy() {
    await this.stop();
  }

  public async start() {
    await this.client.connect();
  }

  public async stop() {
    await this.client.disconnect();
  }

  public async createTinyUrl(hash: string, url: string, ttlInDay = TTL_IN_DAY) {
    const ttlInSeconds: number = ttlInDay * SECONDS_IN_ONE_DAY;
    await this.client.set(hash, url, { EX: ttlInSeconds });
  }

  public async getTinyUrl(hash: string): Promise<Nullable<string>> {
    return await this.client.get(hash);
  }
}

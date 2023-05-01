import { Module } from '@nestjs/common';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [],
  controllers: [ShortenerController],
  providers: [ShortenerService, RedisService],
})
export class ShortenerModule {}

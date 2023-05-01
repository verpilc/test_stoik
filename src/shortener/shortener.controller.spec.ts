import { Test, TestingModule } from '@nestjs/testing';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { Response } from 'express';
import { RedisService } from '../redis/redis.service';
import { HashUtils } from '../utils/hash.utils';
import { SECONDS_IN_ONE_DAY } from '../redis/redis.constants';

describe('ShortenerController', () => {
  let shortenerController: ShortenerController;
  let redisService: RedisService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ShortenerController],
      providers: [ShortenerService, RedisService],
    }).compile();

    shortenerController = app.get<ShortenerController>(ShortenerController);
    redisService = app.get<RedisService>(RedisService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('redirectUrl', () => {
    it('should throw 404 error if url not found', async () => {
      const redirectSpy: jest.SpyInstance = jest.fn();
      const response: Response = {
        redirect: redirectSpy,
      } as unknown as Response;

      const hash: string = 'hash';

      const clientGetSpy: jest.SpyInstance = jest
        .fn()
        .mockImplementationOnce(async () => {
          return;
        });
      (redisService as any).client = { get: clientGetSpy };

      await expect(
        shortenerController.redirectUrl({ hash }, response),
      ).rejects.toThrow('Not found');
      expect(clientGetSpy).toHaveBeenCalledTimes(1);
      expect(clientGetSpy).toHaveBeenCalledWith(hash);
      expect(redirectSpy).not.toHaveBeenCalled();
    });
    it('should redirect to found url', async () => {
      const redirectSpy: jest.SpyInstance = jest.fn();
      const response: Response = {
        redirect: redirectSpy,
      } as unknown as Response;

      const hash: string = 'hash';
      const tinyUrl: string = 'tinyUrl';

      const clientGetSpy: jest.SpyInstance = jest
        .fn()
        .mockImplementationOnce(async () => tinyUrl);
      (redisService as any).client = { get: clientGetSpy };

      await shortenerController.redirectUrl({ hash }, response);
      expect(clientGetSpy).toHaveBeenCalledTimes(1);
      expect(clientGetSpy).toHaveBeenCalledWith(hash);
      expect(redirectSpy).toHaveBeenCalledTimes(1);
      expect(redirectSpy).toHaveBeenCalledWith(tinyUrl);
    });
  });

  describe('createTinyUrl', () => {
    it('should call redis client to create hash on db', async () => {
      const hash: string = 'hash';
      const url: string = 'url';

      const createHashSpy: jest.SpyInstance = jest
        .spyOn(HashUtils, 'createHash')
        .mockImplementationOnce(() => hash);

      const clientSetSpy: jest.SpyInstance = jest
        .fn()
        .mockImplementationOnce(async () => {
          return;
        });
      (redisService as any).client = { set: clientSetSpy };

      const tinyUrl: string = await shortenerController.createTinyUrl({ url });
      expect(createHashSpy).toHaveBeenCalledTimes(1);
      expect(createHashSpy).toHaveBeenCalledWith(url);
      expect(clientSetSpy).toHaveBeenCalledTimes(1);
      expect(clientSetSpy).toHaveBeenCalledWith(hash, url, {
        EX: 10 * SECONDS_IN_ONE_DAY,
      });
      expect(tinyUrl).toEqual(hash);
    });
  });
});

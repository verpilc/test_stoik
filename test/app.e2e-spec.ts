/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RedisClientType, createClient } from 'redis';
import { Opt } from '../src/types/common.types';

describe('AppModule (e2e)', () => {
  let app: INestApplication;
  let client: Opt<RedisClientType> = createClient();

  beforeAll(async () => {
    client = createClient();
    await client.connect();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    if (client) await client.flushAll();
  });

  afterAll(async () => {
    if (client) await client.disconnect();
    await app.close();
  });

  it('return not found if hash not found', async () => {
    expect(client).toBeDefined();

    const hash: string = 'hash';

    return request(app.getHttpServer())
      .get(`/${hash}`)
      .expect(404)
      .expect('{"statusCode":404,"message":"Not found"}');
  });

  it('get redirect with /hash', async () => {
    expect(client).toBeDefined();

    const hash: string = 'hash';
    const url: string = 'http://localhost.com';

    await client!.set(hash, url);

    return request(app.getHttpServer())
      .get(`/${hash}`)
      .expect(302)
      .expect(`Found. Redirecting to ${url}`);
  });
});

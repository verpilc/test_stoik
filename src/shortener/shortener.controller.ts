import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ShortenerService } from './shortener.service';
import { GetParams } from './shortener.types';
import { CreateTinyUrlDto } from './shortener.dtos';
import { Nullable } from '../types/common.types';
import { Response } from 'express';

@Controller()
export class ShortenerController {
  constructor(private readonly shortenerService: ShortenerService) {}

  @Get(':hash')
  async redirectUrl(
    @Param() params: GetParams,
    @Res() response: Response,
  ): Promise<void> {
    const url: Nullable<string> = await this.shortenerService.getUrl(
      params.hash,
    );
    if (!url) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    response.redirect(url);
  }

  @Post()
  async createTinyUrl(
    @Body() createTinyUrlDto: CreateTinyUrlDto,
  ): Promise<string> {
    return await this.shortenerService.createTinyUrl(createTinyUrlDto.url);
  }
}

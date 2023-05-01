import { IsUrl } from 'class-validator';

export class CreateTinyUrlDto {
  @IsUrl()
  url: string;
}

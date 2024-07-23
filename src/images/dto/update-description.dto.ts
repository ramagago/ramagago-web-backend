import { IsString } from 'class-validator';

export class UpdateDescriptionDto {
  @IsString()
  id: string;

  @IsString()
  description: string;
}

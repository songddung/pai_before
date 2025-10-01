import { IsString, IsOptional, } from 'class-validator';
import { UpdateQuizDto as IUpdateQuizDto } from '@your-org/shared-types';

export class UpdateQuizDto implements IUpdateQuizDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsString()
  reward?: string;
}
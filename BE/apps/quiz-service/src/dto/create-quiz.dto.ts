import { IsString, IsOptional, } from 'class-validator';
import { CreateQuizDto as ICreateQuizDto } from '@your-org/shared-types';

export class CreateQuizDto implements ICreateQuizDto {
  @IsString()
  question!:string;

  @IsString()
  answer!: string;

  @IsOptional()
  @IsString()
  reward?: string;
}
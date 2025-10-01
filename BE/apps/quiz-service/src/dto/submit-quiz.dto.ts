import { IsString, IsNotEmpty } from 'class-validator';
import { SubmitQuizDto as ISubmitQuizDto } from '@your-org/shared-types';

export class SubmitQuizDto implements ISubmitQuizDto {
  @IsString()
  @IsNotEmpty()
  answer!: string;
}
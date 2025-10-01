import { UpdateProfileDto as IUpdateProfileDto } from '@your-org/shared-types';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateProfileDto implements IUpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MALE', 'FEMALE'])
  gender?: 'MALE' | 'FEMALE';

  @IsOptional()
  @IsString()
  avatar_media_id?: string;

  @IsOptional()
  @IsString()
  voice_media_id?: string;

  @IsOptional()
  @IsString()
  @Length(4, 6)
  pin?: string;
}

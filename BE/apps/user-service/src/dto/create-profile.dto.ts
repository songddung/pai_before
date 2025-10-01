import { CreateProfileDto as ICreateProfileDto } from '@your-org/shared-types';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
export class CreateProfileDto implements ICreateProfileDto {
  @IsString()
  user_id: string;

  @IsString()
  @IsIn(['PARENT', 'CHILD'])
  profile_type: 'PARENT' | 'CHILD';

  @IsString()
  @Length(1, 50)
  name: string;

  @IsDateString()
  birth_date: string;

  @IsString()
  @IsIn(['MALE', 'FEMALE'])
  gender: 'MALE' | 'FEMALE';

  @IsString()
  @IsOptional()
  avatar_media_id: string;

  @ValidateIf((o) => o.profile_type === 'PARENT')
  @IsString()
  @Length(4, 6)
  pin?: string;
}

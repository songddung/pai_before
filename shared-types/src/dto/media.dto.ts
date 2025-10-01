import { IsString, IsEnum } from 'class-validator';
import { UploaderType } from '../type/types';

export class CreateMediaDto {
  @IsString()
  uploader_id!: string;

  @IsEnum(UploaderType)
  uploader_type!: 'PARENT' | 'CHILD';
}

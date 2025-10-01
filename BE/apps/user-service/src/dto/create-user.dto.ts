import { IsEmail, IsString, MinLength } from 'class-validator';
import { CreateUserDto as ICreateUserDto } from '@your-org/shared-types';

export class CreateUserDto implements ICreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  address!: string;
}
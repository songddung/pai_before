import { LoginDto as ILoginDto } from '@your-org/shared-types';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto implements ILoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password: string;
}

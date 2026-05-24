import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  mfaCode?: string;
}
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class MailDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsEmail()
  email!: string;

  @IsString()
  subject!: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  fecha?: string;

  @IsOptional()
  @IsString()
  cancha?: string;

  @IsOptional()
  @IsString()
  hora?: string;

  @IsOptional()
  @IsString()
  club?: string;
}

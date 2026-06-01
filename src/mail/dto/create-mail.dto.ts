import { IsEmail, IsString } from 'class-validator';

export class MailDto {
  @IsString()
  nombre!: string;

  @IsEmail()
  email!: string;

  @IsString()
  subject!: string;

  @IsString()
  message!: string;
}

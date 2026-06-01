import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register/usuario')
  registerUsuario(@Body() body: any) {
    return this.authService.registerUsuario(body);
  }

  @Post('register/dueno')
  @UseInterceptors(FileInterceptor('logo'))
  registerDueno(@Body() body: any, @UploadedFile() file: any) {
    return this.authService.registerDueno(body, file);
  }
}
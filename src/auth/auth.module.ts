import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';
import { MailModule } from '../mail/mail.module'; // 1. IMPORTACIÓN: Traemos el módulo de correos

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
    MailModule, // 2. FUNCIÓN: Inyección de Módulo
    // ¿Qué hace?: Registra el MailModule dentro del contexto de autenticación para que
    // el AuthService pueda acceder al MailService (y a su vez a la API HTTP de Resend).
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
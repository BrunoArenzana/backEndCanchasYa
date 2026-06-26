import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [ConfigModule],
  controllers: [MailController],
  providers: [
    MailService,
    {
      provide: 'RESEND_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Resend(configService.get<string>('RESEND_API_KEY'));
      },
      inject: [ConfigService],
    },
  ],
  // 👇 AQUÍ ES DONDE LO EXPORTAS 👇
  // FUNCIÓN: Exports del Módulo
  // ¿Qué hace?: Hace que el MailService sea "público" para que otros módulos (como AuthModule) puedan usarlo.
  exports: [MailService], 
})
export class MailModule {} // <- Recuerda que el nombre de la clase debe ser exactamente MailModule
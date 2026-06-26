import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [ConfigModule],
  controllers: [MailController],
  providers: [
    MailService,
    {
      provide: 'GMAIL_CLIENT',
      useFactory: (configService: ConfigService) => {
        const clientId = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
        const refreshToken = configService.get<string>('GOOGLE_REFRESH_TOKEN');

        const oauth2Client = new google.auth.OAuth2(
          clientId,
          clientSecret,
        );

        oauth2Client.setCredentials({
          refresh_token: refreshToken,
        });

        return google.gmail({ version: 'v1', auth: oauth2Client });
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
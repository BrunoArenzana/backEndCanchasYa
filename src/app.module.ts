import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservaModule } from './reserva/reserva.module';
import { ClubModule } from './club/club.module';
import { PagoModule } from './pago/pago.module';
import { DeporteModule } from './deporte/deporte.module';
import { CanchaModule } from './cancha/cancha.module';
import { DisponibilidadModule } from './disponibilidad/disponibilidad.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import { GeorefModule } from './georef/georef.module';
import { AuthModule } from './auth/auth.module'
import { RolesGuard } from './auth/guard/roles.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            ssl: { rejectUnauthorized: false },
            autoLoadEntities: true,
            synchronize: false,
        }),

        MailerModule.forRoot({
            transport: {
                host: process.env.MAIL_HOST || 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                tls: {
                    rejectUnauthorized: false, // Permite la conexión desde Render
                }
            }
        }),
        // MailerModule.forRootAsync({
        //     inject: [ConfigService],
        //     useFactory: (config: ConfigService) => ({
        //         transport: {
        //             host: config.get('MAIL_HOST') || 'smtp.gmail.com',
        //             port: Number(config.get('MAIL_PORT')) || 587,
        //             secure: false,
        //             //ts-expect-error: TypeScript doesn't map family but node uses 
        //             // it for ipv4
        //             family: 4,
        //             auth: {
        //                 user: config.get('MAIL_USER'),
        //                 pass: config.get('MAIL_PASS'),
        //             },
        //         },
        //         defaults: {
        //             from: config.get('MAIL_FROM') || config.get('MAIL_USER'),
        //         },
        //     }),
        // }),
        ReservaModule,
        ClubModule,
        PagoModule,
        DeporteModule,
        CanchaModule,
        DisponibilidadModule,
        MailModule,
        UserModule,
        GeorefModule,
        AuthModule,
    ],
    controllers: [],
    providers: [/*{ provide: APP_GUARD , useClass: RolesGuard }*/],

})
export class AppModule { }

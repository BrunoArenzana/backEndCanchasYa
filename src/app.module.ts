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
import { AuthModule } from './auth/auth.module'
import { RolesGuard } from './auth/guard/roles.guard';
import { APP_GUARD } from '@nestjs/core';
    
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            autoLoadEntities: true,
            synchronize: true,
        }),
        MailerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                transport: {
                    host: config.get('MAIL_HOST'),
                    port: Number(config.get('MAIL_PORT')),
                    secure: false,
                    auth: {
                        user: config.get('MAIL_USER'),
                        pass: config.get('MAIL_PASS'),
                    },
                },
                defaults: {
                    from: config.get('MAIL_FROM'),
                },
            }),
        }),
        ReservaModule,
        ClubModule,
        PagoModule,
        DeporteModule,
        CanchaModule,
        DisponibilidadModule,
        MailModule,
        UserModule,
        AuthModule,
    ],
    controllers: [],
    providers: [/*{ provide: APP_GUARD , useClass: RolesGuard }*/],
    
})
export class AppModule { }

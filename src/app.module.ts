import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { ReservaModule } from './reserva/reserva.module';
import { UsuarioModule } from './usuario/usuario.module';
import { ClubModule } from './club/club.module';
import { PagoModule } from './pago/pago.module';
import { DuenoCanchaModule } from './dueno_cancha/dueno_cancha.module';
import { DeporteModule } from './deporte/deporte.module';
import { CanchaModule } from './cancha/cancha.module';
import { DisponibilidadModule } from './disponibilidad/disponibilidad.module';
import { Usuario } from './usuario/entities/usuario.entity';
import { Admin } from './admin/entities/admin.entity';
import { Reserva } from './reserva/entities/reserva.entity';
import { Club } from './club/entities/club.entity';
import { Pago } from './pago/entities/pago.entity';
import { DuenoCancha } from './dueno_cancha/entities/dueno_cancha.entity';
import { Deporte } from './deporte/entities/deporte.entity';
import { Cancha } from './cancha/entities/cancha.entity';
import { Disponibilidad } from './disponibilidad/entities/disponibilidad.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './mail/mail.module';


@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                username: configService.get<string>('DB_USER'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true,
            }),

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
        AdminModule,
        ReservaModule,
        UsuarioModule,
        ClubModule,
        PagoModule,
        DuenoCanchaModule,
        DeporteModule,
        CanchaModule,
        DisponibilidadModule,
        MailModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
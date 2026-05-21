import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservaModule } from './reserva/reserva.module';
import { ClubModule } from './club/club.module';
import { PagoModule } from './pago/pago.module';
import { DeporteModule } from './deporte/deporte.module';
import { CanchaModule } from './cancha/cancha.module';
import { DisponibilidadModule } from './disponibilidad/disponibilidad.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReviewPayCron } from './cron/reviewPay.cron';
import { Club } from './club/entities/club.entity';
import { Cancha } from './cancha/entities/cancha.entity';
import * as fs from 'fs';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
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
        logging: true
      }),
    }),
    ReservaModule,
    UserModule,
    ClubModule,
    PagoModule,
    DeporteModule,
    CanchaModule,
    DisponibilidadModule,
    AuthModule,
    TypeOrmModule.forFeature([Club, Cancha]),
  ],
  controllers: [],
  providers: [ReviewPayCron],
})
export class AppModule { }

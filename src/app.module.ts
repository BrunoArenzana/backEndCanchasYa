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
        synchronize: true
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
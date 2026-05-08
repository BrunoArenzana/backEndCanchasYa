import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ReviewPayCron } from './cron/reviewPay.cron';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
		// DB disabled intentionally to allow booting backend without MySQL.
		// TypeOrmModule.forRootAsync(...)

		// DB-backed modules disabled intentionally.
		// AdminModule,
		// ReservaModule,
		// UsuarioModule,
		// ClubModule,
		// PagoModule,
		// DuenoCanchaModule,
		// DeporteModule,
		// CanchaModule,
		// DisponibilidadModule,
	],
	controllers: [],
	providers: [ReviewPayCron],
})
export class AppModule { }
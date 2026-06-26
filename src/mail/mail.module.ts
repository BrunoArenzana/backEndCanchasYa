import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Global() // Lo hacemos global para usarlo en cualquier servicio sin reimportar
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'RESEND_CLIENT',
      // FUNCIÓN: Fábrica del Cliente Resend
      // ¿Qué hace?: Inicializa la instancia oficial de Resend usando la API Key de Render.
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('RESEND_API_KEY');
        return new Resend(apiKey);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['RESEND_CLIENT'], // Exportamos el token para que otros servicios lo usen
})
export class EmailModule {}
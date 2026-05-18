import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from '../club/entities/club.entity';
// Importamos la entidad Cancha
import { Cancha } from '../cancha/entities/cancha.entity';

@Injectable()
export class ReviewPayCron {
  private readonly logger = new Logger(ReviewPayCron.name);

  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>, //traemos aca el injectrepository para poder usar las funciones de typeorm
    @InjectRepository(Cancha) //traemos aca el injectrepository para poder usar las funciones de typeorm
    private readonly canchaRepository: Repository<Cancha>,
  ) { }

  // Se ejecuta todos los días a las 00:00
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) //el midnigth es a media noche
  async handleCron() {
    this.logger.debug('Revisando pagos pendientes...');

    const clubes = await this.clubRepository.find(); // Obtenemos todos los clubes

    for (const club of clubes) { // con este for recoremos cada club con su fecha de vencimiento de pago y comparamos si es menor a la fecha actual
      if (club.vencimiento_pago < new Date()) { // si es menor la fecha de vencimiento a la fecha actual entonces se cumple la condicion

        //Actualizamos el estado del club a 'inactivo'
        club.estado = 'inactivo';
        await this.clubRepository.save(club);

        // Desactivamos todas las canchas que pertenezcan a este club.
        // Hacemos un update masivo directo en la base de datos (más eficiente).
        await this.canchaRepository.update(
          { club: { id_club: club.id_club } }, // Condición: canchas cuyo id_club sea el de este club // Valores a cambiar: activa = 0
          { activa: 0 }
        );

        this.logger.debug(// muestra por consola que se ejecuto el cron para ese club especifico
          `Club ${club.nombre_club} y sus canchas marcados como inactivos (pago vencido).`,
        );
      }
    }
  }
}

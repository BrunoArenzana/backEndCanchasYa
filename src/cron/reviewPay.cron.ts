import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Cancha } from "src/cancha/entities/cancha.entity";
import { Club } from "src/club/entities/club.entity";

@Injectable()
export class ReviewPayCron {

    private readonly logger = new Logger(ReviewPayCron.name);

    @Cron(CronExpression.EVERY_5_SECONDS)
    handleCron() {
        this.logger.debug('Revisando pagos pendientes...');
        const c = new Club();// traer de la base de datos
        // recorrer todos los clubes
        if (c.created_at < new Date()) {
            c.estado = 'inactivo';
        }
    }
}
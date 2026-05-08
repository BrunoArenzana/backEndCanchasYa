import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ReviewPayCron {

    private readonly logger = new Logger(ReviewPayCron.name);

    @Cron(CronExpression.EVERY_5_SECONDS)
    handleCron() {
        this.logger.debug('Revisando pagos pendientes...');
    }

}
import { Module } from '@nestjs/common';
import { DeporteService } from './deporte.service';
import { DeporteController } from './deporte.controller';

@Module({
  controllers: [DeporteController],
  providers: [DeporteService],
})
export class DeporteModule {}

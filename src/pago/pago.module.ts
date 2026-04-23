import { Module } from '@nestjs/common';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
@Module({
  imports : [TypeOrmModule.forFeature([Pago])],
  controllers: [PagoController],
  providers: [PagoService],
})
export class PagoModule {}

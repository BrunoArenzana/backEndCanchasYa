import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DuenoCanchaService } from './dueno_cancha.service';
import { DuenoCanchaController } from './dueno_cancha.controller';
import { DuenoCancha } from './entities/dueno_cancha.entity';
import { Club } from '../club/entities/club.entity';
import { Cancha } from '../cancha/entities/cancha.entity';
import { Deporte } from '../deporte/entities/deporte.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DuenoCancha, Club, Cancha, Deporte]),
  ],
  controllers: [DuenoCanchaController],
  providers: [DuenoCanchaService],
  exports: [DuenoCanchaService],
})
export class DuenoCanchaModule {}
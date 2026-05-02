import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DuenoCanchaService } from './dueno_cancha.service';
import { DuenoCanchaController } from './dueno_cancha.controller';
import { DuenoCancha } from './entities/dueno_cancha.entity';
import { Club } from '../club/entities/club.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DuenoCancha, Club]),
  ],
  controllers: [DuenoCanchaController],
  providers: [DuenoCanchaService],
  exports: [DuenoCanchaService], // 👈 opcional pero recomendado
})
export class DuenoCanchaModule {}
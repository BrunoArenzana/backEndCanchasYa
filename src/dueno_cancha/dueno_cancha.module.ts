import { Module } from '@nestjs/common';
import { DuenoCanchaService } from './dueno_cancha.service';
import { DuenoCanchaController } from './dueno_cancha.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DuenoCancha } from './entities/dueno_cancha.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DuenoCancha])],
  controllers: [DuenoCanchaController],
  providers: [DuenoCanchaService],
})
export class DuenoCanchaModule {}

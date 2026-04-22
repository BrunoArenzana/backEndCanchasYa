import { Module } from '@nestjs/common';
import { DuenoCanchaService } from './dueno_cancha.service';
import { DuenoCanchaController } from './dueno_cancha.controller';

@Module({
  controllers: [DuenoCanchaController],
  providers: [DuenoCanchaService],
})
export class DuenoCanchaModule {}

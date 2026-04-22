import { Module } from '@nestjs/common';
import { CanchaService } from './cancha.service';
import { CanchaGateway } from './cancha.gateway';

@Module({
  providers: [CanchaGateway, CanchaService],
})
export class CanchaModule {}

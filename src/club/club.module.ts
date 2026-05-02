import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';
import { Club } from './entities/club.entity';
import { DuenoCancha } from '../dueno_cancha/entities/dueno_cancha.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Club, DuenoCancha]),
  ],
  controllers: [ClubController],
  providers: [ClubService],
  exports: [ClubService],
})
export class ClubModule {}
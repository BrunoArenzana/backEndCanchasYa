import { Injectable } from '@nestjs/common';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto } from './dto/update-cancha.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cancha } from './entities/cancha.entity';

@Injectable()
export class CanchaService {
  constructor(
    @InjectRepository(Cancha)
    private canchaRepository: Repository<Cancha>,
  ) {}

  create(createCanchaDto: CreateCanchaDto) {
    const cancha = this.canchaRepository.create(createCanchaDto);
    return this.canchaRepository.save(cancha);
  }

  findAll() {
    return this.canchaRepository.find({
      relations: ['club', 'deporte'],
      where: { activa: 1 },
    });
  }

  findOne(id: number) {
    return this.canchaRepository.findOne({
      where: { id_cancha: id },
      relations: ['club', 'deporte'],
    });
  }

  findByClub(idClub: number) {
    return this.canchaRepository.find({
      where: {
        club: {
          id_club: idClub,
        },
        activa: 1,
      },
      relations: ['club', 'deporte'],
    });
  }

  update(id: number, updateCanchaDto: UpdateCanchaDto) {
    return this.canchaRepository.update({ id_cancha: id }, updateCanchaDto);
  }

  remove(id: number) {
    return this.canchaRepository.delete({ id_cancha: id });
  }
}
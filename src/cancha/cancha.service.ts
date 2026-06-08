import { Injectable, Post } from '@nestjs/common';
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
    const { id_club, id_deporte, ...rest } = createCanchaDto;

    const cancha = this.canchaRepository.create({
      ...rest,
      id_club: { id_club } as any,
      id_deporte: { id_deporte } as any ,
    });

    return this.canchaRepository.save(cancha);
  }


  findAll() {
    return this.canchaRepository.find({
      relations: ['id_club', 'id_deporte'],
      where: { activa: 1 },
    });
  }

  findOne(id: number) {
    return this.canchaRepository.findOne({
      where: { id_cancha: id },
      relations: ['id_club', 'id_deporte'],
    });
  }

  findByClub(idClub: number) {
    return this.canchaRepository.find({
      where: {
        id_club: {
          id_club: idClub,
        },
        activa: 1,
      },
      relations: ['id_club', 'id_deporte'],
    });
  }

  async update(id: number, updateCanchaDto: UpdateCanchaDto) {
    const { id_club, id_deporte, ...rest } = updateCanchaDto;

    const payload = {
      ...rest,
      ...(id_club !== undefined ? { id_club: { id_club } as any } : {}),
      ...(id_deporte !== undefined ? { id_deporte: { id_deporte } as any } : {}),
    };

    return this.canchaRepository.update({ id_cancha: id }, payload);
  }

  remove(id: number) {
    return this.canchaRepository.delete({ id_cancha: id });
  }
}
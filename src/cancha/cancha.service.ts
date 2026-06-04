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

  private normalizarCancha(cancha: Cancha | null) {
    if (!cancha) return null;

    return {
      ...cancha,
      club: cancha.id_club,
      deporte: cancha.id_deporte,
    };
  }

  async create(createCanchaDto: CreateCanchaDto) {
    const { id_club, id_deporte, ...rest } = createCanchaDto;

    const cancha = this.canchaRepository.create({
      ...rest,
      id_club: { id_club } as any,
      id_deporte: { id_deporte } as any ,
    });

    const canchaGuardada = await this.canchaRepository.save(cancha);
    return this.findOne(canchaGuardada.id_cancha);
  }

  async findAll() {
    const canchas = await this.canchaRepository.find({
      relations: ['id_club', 'id_deporte'],
      where: { activa: 1 },
    });

    return canchas.map((cancha) => this.normalizarCancha(cancha));
  }

  async findOne(id: number) {
    const cancha = await this.canchaRepository.findOne({
      where: { id_cancha: id },
      relations: ['id_club', 'id_deporte'],
    });

    return this.normalizarCancha(cancha);
  }

  findByClub(idClub: number) {
    return this.canchaRepository
      .createQueryBuilder('cancha')
      .leftJoinAndSelect('cancha.id_club', 'club')
      .leftJoinAndSelect('cancha.id_deporte', 'deporte')
      .where('cancha.id_club = :idClub', { idClub })
      .andWhere('cancha.activa = :activa', { activa: 1 })
      .getMany();
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

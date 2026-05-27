import { Injectable } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
  ) { }

  async create(createReservaDto: CreateReservaDto) {
    const { id_usuario, id_cancha, ...rest } = createReservaDto;
    const reserva = this.reservaRepository.create({
      ...rest,
      usuario: id_usuario ? { id_usuario } : undefined,
      cancha: id_cancha ? { id_cancha } : undefined,
    });
    return this.reservaRepository.save(reserva);
  }

  findAll() {
    return this.reservaRepository.find({
      relations: ['usuario', 'cancha', 'cancha.club', 'cancha.deporte']
    });
  }

  findByUsuario(idUsuario: number) {
    return this.reservaRepository.find({
      where: { usuario: { id_usuario: idUsuario } },
      relations: ['usuario', 'cancha', 'cancha.club', 'cancha.deporte']
    });
  }

  findByClub(idClub: number) {
    return this.reservaRepository.find({
      where: { cancha: { club: { id_club: idClub } } },
      relations: ['usuario', 'cancha', 'cancha.club', 'cancha.deporte']
    });
  }

  findOne(id: number) {
    return this.reservaRepository.findOne({
      where: { id_reserva: id },
      relations: ['usuario', 'cancha', 'cancha.club', 'cancha.deporte']
    });
  }

  async update(id: number, updateReservaDto: UpdateReservaDto) {
    const { id_usuario, id_cancha, ...rest } = updateReservaDto;


    const reserva = await this.reservaRepository.findOne({ where: { id_reserva: id } });
    if (!reserva) return null;

    Object.assign(reserva, rest);

    if (id_usuario !== undefined) {
      reserva.usuario = { id_usuario } as any;
    }

    if (id_cancha !== undefined) {
      reserva.cancha = { id_cancha } as any;
    }

    return this.reservaRepository.save(reserva);
  }

  remove(id: number) {
    return this.reservaRepository.delete({ id_reserva: id });
  }
}

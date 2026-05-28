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

  private normalizarReserva(reserva: Reserva | null) {
    if (!reserva) return null;

    return {
      ...reserva,
      cancha: reserva.cancha
        ? {
            ...reserva.cancha,
            club: reserva.cancha.id_club,
            deporte: reserva.cancha.id_deporte,
          }
        : reserva.cancha,
    };
  }

  async create(createReservaDto: CreateReservaDto) {
    const { id_usuario, id_cancha, ...rest } = createReservaDto;
    const reserva = this.reservaRepository.create({
      ...rest,
      usuario: id_usuario ? { id_usuario } : undefined,
      cancha: id_cancha ? { id_cancha } : undefined,
    });
    const reservaGuardada = await this.reservaRepository.save(reserva);
    return this.findOne(reservaGuardada.id_reserva);
  }

  async findAll() {
    const reservas = await this.reservaRepository.find({
      relations: ['usuario', 'cancha', 'cancha.id_club', 'cancha.id_deporte']
    });

    return reservas.map((reserva) => this.normalizarReserva(reserva));
  }

  async findByUsuario(idUsuario: number) {
    const reservas = await this.reservaRepository.find({
      where: { usuario: { id_usuario: idUsuario } },
      relations: ['usuario', 'cancha', 'cancha.id_club', 'cancha.id_deporte']
    });

    return reservas.map((reserva) => this.normalizarReserva(reserva));
  }

  async findByClub(idClub: number) {
    const reservas = await this.reservaRepository.find({
      where: { cancha: { id_club: { id_club: idClub } } },
      relations: ['usuario', 'cancha', 'cancha.id_club', 'cancha.id_deporte']
    });

    return reservas.map((reserva) => this.normalizarReserva(reserva));
  }

  async findOne(id: number) {
    const reserva = await this.reservaRepository.findOne({
      where: { id_reserva: id },
      relations: ['usuario', 'cancha', 'cancha.id_club', 'cancha.id_deporte']
    });

    return this.normalizarReserva(reserva);
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

    const reservaGuardada = await this.reservaRepository.save(reserva);
    return this.findOne(reservaGuardada.id_reserva);
  }

  remove(id: number) {
    return this.reservaRepository.delete({ id_reserva: id });
  }
}

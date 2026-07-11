import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { Reserva } from './entities/reserva.entity';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
  ) {}

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

  /*
   * Comprueba si ya existe una reserva activa que se superpone con el
   * intervalo solicitado para la misma cancha y fecha.
   *
   * La condición:
   *   existente.inicio < nueva.fin
   *   existente.fin > nueva.inicio
   * detecta tanto duplicados exactos como cruces parciales de horarios.
   */
  private buscarReservaSolapada({
    idCancha,
    fecha,
    horaInicio,
    horaFin,
    excluirId,
  }: {
    idCancha: number;
    fecha: Date | string;
    horaInicio: string;
    horaFin: string;
    excluirId?: number;
  }) {
    const query = this.reservaRepository
      .createQueryBuilder('reserva')
      .innerJoin('reserva.cancha', 'cancha')
      .where('cancha.id_cancha = :idCancha', { idCancha })
      .andWhere('reserva.fecha = :fecha', { fecha })
      .andWhere('reserva.estado != :estadoCancelado', {
        estadoCancelado: 'cancelada',
      })
      .andWhere('reserva.hora_inicio < :horaFin', { horaFin })
      .andWhere('reserva.hora_fin > :horaInicio', { horaInicio });

    if (excluirId !== undefined) {
      query.andWhere('reserva.id_reserva != :excluirId', { excluirId });
    }

    return query.getOne();
  }

  async create(createReservaDto: CreateReservaDto) {
    const {
      id_usuario,
      id_cancha,
      fecha,
      hora_inicio,
      hora_fin,
      ...rest
    } = createReservaDto;

    const reservaExistente = await this.buscarReservaSolapada({
      idCancha: id_cancha,
      fecha,
      horaInicio: hora_inicio,
      horaFin: hora_fin,
    });

    if (reservaExistente) {
      throw new ConflictException(
        'La cancha ya está reservada para esa fecha y horario.',
      );
    }

    const reserva = this.reservaRepository.create({
      ...rest,
      fecha,
      hora_inicio,
      hora_fin,
      usuario: id_usuario ? ({ id_usuario } as any) : undefined,
      cancha: id_cancha ? ({ id_cancha } as any) : undefined,
    });

    const reservaGuardada = await this.reservaRepository.save(reserva);
    return this.findOne(reservaGuardada.id_reserva);
  }

  async findAll() {
    const reservas = await this.reservaRepository.find({
      relations: [
        'usuario',
        'cancha',
        'cancha.id_club',
        'cancha.id_deporte',
      ],
    });

    return reservas.map((reserva) => this.normalizarReserva(reserva));
  }

  async findByUsuario(idUsuario: number) {
    const reservas = await this.reservaRepository.find({
      where: { usuario: { id_usuario: idUsuario } },
      relations: [
        'usuario',
        'cancha',
        'cancha.id_club',
        'cancha.id_deporte',
      ],
    });

    return reservas.map((reserva) => this.normalizarReserva(reserva));
  }

  async findDisponibilidad(idCancha: number, fecha: string) {
    const reservas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .innerJoin('reserva.cancha', 'cancha')
      .where('cancha.id_cancha = :idCancha', { idCancha })
      .andWhere('reserva.fecha = :fecha', { fecha })
      .andWhere('reserva.estado != :estadoCancelado', {
        estadoCancelado: 'cancelada',
      })
      .orderBy('reserva.hora_inicio', 'ASC')
      .getMany();

    return reservas.map((reserva) => ({
      id_reserva: reserva.id_reserva,
      id_cancha: idCancha,
      fecha: reserva.fecha,
      hora_inicio: reserva.hora_inicio,
      hora_fin: reserva.hora_fin,
      estado: reserva.estado,
    }));
  }

  async findByClub(idClub: number) {
    try {
      const queryReservas = await this.reservaRepository
        .createQueryBuilder('reserva')
        .leftJoinAndSelect('reserva.usuario', 'usuario')
        .leftJoinAndSelect('reserva.cancha', 'cancha')
        .leftJoinAndSelect('cancha.id_club', 'club')
        .leftJoinAndSelect('cancha.id_deporte', 'deporte')
        .where('club.id_club = :idClub', { idClub })
        .getMany();

      return queryReservas.map((reserva) =>
        this.normalizarReserva(reserva),
      );
    } catch (error) {
      console.error('Error fetching reservations for club:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    const reserva = await this.reservaRepository.findOne({
      where: { id_reserva: id },
      relations: [
        'usuario',
        'cancha',
        'cancha.id_club',
        'cancha.id_deporte',
      ],
    });

    return this.normalizarReserva(reserva);
  }

  async update(id: number, updateReservaDto: UpdateReservaDto) {
    const reserva = await this.reservaRepository.findOne({
      where: { id_reserva: id },
      relations: ['usuario', 'cancha'],
    });

    if (!reserva) return null;

    const {
      id_usuario,
      id_cancha,
      fecha,
      hora_inicio,
      hora_fin,
      ...rest
    } = updateReservaDto;

    const idCanchaFinal = id_cancha ?? reserva.cancha?.id_cancha;
    const fechaFinal = fecha ?? reserva.fecha;
    const horaInicioFinal = hora_inicio ?? reserva.hora_inicio;
    const horaFinFinal = hora_fin ?? reserva.hora_fin;

    if (idCanchaFinal && fechaFinal && horaInicioFinal && horaFinFinal) {
      const reservaExistente = await this.buscarReservaSolapada({
        idCancha: idCanchaFinal,
        fecha: fechaFinal,
        horaInicio: horaInicioFinal,
        horaFin: horaFinFinal,
        excluirId: id,
      });

      if (reservaExistente) {
        throw new ConflictException(
          'La cancha ya está reservada para esa fecha y horario.',
        );
      }
    }

    Object.assign(reserva, rest);

    if (fecha !== undefined) {
      reserva.fecha = fecha;
    }

    if (hora_inicio !== undefined) {
      reserva.hora_inicio = hora_inicio;
    }

    if (hora_fin !== undefined) {
      reserva.hora_fin = hora_fin;
    }

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
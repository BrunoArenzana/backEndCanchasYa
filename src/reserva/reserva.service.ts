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

  create(createReservaDto: any) {
    const nuevaReserva = this.reservaRepository.create({
      ...createReservaDto,
      usuario: { id_usuario: createReservaDto.id_usuario },
      cancha: { id_cancha: createReservaDto.id_cancha },
    });
    return this.reservaRepository.save(nuevaReserva);
  }

  findAll() {
    return this.reservaRepository.find({
      relations: ['cancha', 'cancha.club', 'cancha.deporte'],
    });
  }

  findByUsuario(id_usuario: number) {
    return this.reservaRepository.find({
      where: { usuario: { id_usuario: id_usuario } },
      relations: ['cancha', 'cancha.club', 'cancha.deporte'],
    });
  }

  findByClub(id_club: number) {
    return this.reservaRepository.find({
      where: { cancha: { club: { id_club: id_club } } },
      relations: ['cancha', 'cancha.club', 'cancha.deporte'],
    });
  }

  findOne(id: number) {
    return this.reservaRepository.findOneBy({ id_reserva: id });
  }

  update(id: number, updateReservaDto: any) {
    const { id_usuario, id_cancha, ...resto } = updateReservaDto;

    return this.reservaRepository.update(
      { id_reserva: id },
      {
        ...resto,
        usuario: id_usuario ? { id_usuario } : undefined,
        cancha: id_cancha ? { id_cancha } : undefined,
      }
    );
  }

  remove(id: number) {
    return this.reservaRepository.delete({ id_reserva: id });
  }
}

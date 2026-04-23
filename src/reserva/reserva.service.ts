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
  ) {}

  create(createReservaDto: CreateReservaDto) {
    return this.reservaRepository.save(createReservaDto);
  }

  findAll() {
    return this.reservaRepository.find();
  }

  findOne(id: number) {
    return this.reservaRepository.findOneBy({ id_reserva: id });
  }

  update(id: number, updateReservaDto: UpdateReservaDto) {
    return this.reservaRepository.update({ id_reserva: id }, updateReservaDto);
  }

  remove(id: number) {
    return this.reservaRepository.delete({ id_reserva: id });
  }
}

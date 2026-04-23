import { Injectable } from '@nestjs/common';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disponibilidad } from './entities/disponibilidad.entity';

@Injectable()
export class DisponibilidadService {
  constructor(
    @InjectRepository(Disponibilidad)
    private readonly disponibilidadRepository: Repository<Disponibilidad>,
  ) {}

  create(createDisponibilidadDto: CreateDisponibilidadDto) {
    const disponibilidad = this.disponibilidadRepository.create(createDisponibilidadDto);
    return this.disponibilidadRepository.save(disponibilidad);
  }

  findAll() {
    return this.disponibilidadRepository.find();
  }

  findOne(id: number) {
    return this.disponibilidadRepository.findOneBy({ id_disponibilidad: id });
  }

  update(id: number, updateDisponibilidadDto: UpdateDisponibilidadDto) {
    return this.disponibilidadRepository.update({ id_disponibilidad: id }, updateDisponibilidadDto);
  }

  remove(id: number) {
    return this.disponibilidadRepository.delete({ id_disponibilidad: id });
  }
}

import { Injectable } from '@nestjs/common';
import { CreateDuenoCanchaDto } from './dto/create-dueno_cancha.dto';
import { UpdateDuenoCanchaDto } from './dto/update-dueno_cancha.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DuenoCancha } from './entities/dueno_cancha.entity';

@Injectable()
export class DuenoCanchaService {
  constructor(
    @InjectRepository(DuenoCancha)
    private duenoCanchaRepository: Repository<DuenoCancha>,
  ) {}

  create(createDuenoCanchaDto: CreateDuenoCanchaDto) {
    const duenoCancha = this.duenoCanchaRepository.create(createDuenoCanchaDto);
    return this.duenoCanchaRepository.save(duenoCancha);2
  }

  findAll() {
    return this.duenoCanchaRepository.find();
  }

  findOne(id: number) {
    return this.duenoCanchaRepository.findOne({ where: { id_dueno: id } });
  }

  update(id: number, updateDuenoCanchaDto: UpdateDuenoCanchaDto) {
    return this.duenoCanchaRepository.update({ id_dueno: id }, updateDuenoCanchaDto);
  }

  remove(id: number) {
    return this.duenoCanchaRepository.delete({ id_dueno: id });
  }
}

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
    return this.canchaRepository.find();
  }

  findOne(id: number) {
    return this.canchaRepository.findOne({ where: { id_cancha: id } });
  }

  update(id: number, updateCanchaDto: UpdateCanchaDto) {
    return this.canchaRepository.update(id, updateCanchaDto);
  }

  remove(id: number) {
    return this.canchaRepository.delete(id);
  }
}

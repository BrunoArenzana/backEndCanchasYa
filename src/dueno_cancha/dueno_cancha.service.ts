import { Injectable } from '@nestjs/common';
import { CreateDuenoCanchaDto } from './dto/create-dueno_cancha.dto';
import { UpdateDuenoCanchaDto } from './dto/update-dueno_cancha.dto';

@Injectable()
export class DuenoCanchaService {
  create(createDuenoCanchaDto: CreateDuenoCanchaDto) {
    return 'This action adds a new duenoCancha';
  }

  findAll() {
    return `This action returns all duenoCancha`;
  }

  findOne(id: number) {
    return `This action returns a #${id} duenoCancha`;
  }

  update(id: number, updateDuenoCanchaDto: UpdateDuenoCanchaDto) {
    return `This action updates a #${id} duenoCancha`;
  }

  remove(id: number) {
    return `This action removes a #${id} duenoCancha`;
  }
}

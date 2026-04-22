import { Injectable } from '@nestjs/common';
import { CreateDeporteDto } from './dto/create-deporte.dto';
import { UpdateDeporteDto } from './dto/update-deporte.dto';

@Injectable()
export class DeporteService {
  create(createDeporteDto: CreateDeporteDto) {
    return 'This action adds a new deporte';
  }

  findAll() {
    return `This action returns all deporte`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deporte`;
  }

  update(id: number, updateDeporteDto: UpdateDeporteDto) {
    return `This action updates a #${id} deporte`;
  }

  remove(id: number) {
    return `This action removes a #${id} deporte`;
  }
}

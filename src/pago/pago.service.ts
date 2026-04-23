import { Injectable } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Pago } from './entities/pago.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
  ) {}
  create(createPagoDto: CreatePagoDto) {
    return this.pagoRepository.save(createPagoDto);
  }

  findAll() {
    return this.pagoRepository.find();
  }

  findOne(id: number) {
    return this.pagoRepository.findOneBy({ id_pago: id });
  }

  update(id: number, updatePagoDto: UpdatePagoDto) {
    return this.pagoRepository.update({ id_pago: id }, updatePagoDto);
  }

  remove(id: number) {
    return this.pagoRepository.delete({ id_pago: id });
  }
}

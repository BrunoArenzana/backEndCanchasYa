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

  /**
   * Devuelve todas las disponibilidades de una cancha específica.
   */
  findByCancha(idCancha: number) {
    return this.disponibilidadRepository.find({
      where: { cancha: { id_cancha: idCancha } },
      order: { dia_semana: 'ASC', hora_inicio: 'ASC' },
    });
  }

  /**
   * Reemplaza todas las disponibilidades de una cancha.
   * Borra las anteriores y guarda las nuevas en una transacción.
   */
  async replaceForCancha(
    idCancha: number,
    disponibilidades: { dia_semana: number; hora_inicio: string; hora_fin: string }[],
  ) {
    // Borrar las disponibilidades anteriores de esta cancha
    await this.disponibilidadRepository.delete({ cancha: { id_cancha: idCancha } });

    if (!disponibilidades || disponibilidades.length === 0) {
      return [];
    }

    // Crear las nuevas disponibilidades
    const nuevas = disponibilidades.map((d) =>
      this.disponibilidadRepository.create({
        dia_semana: d.dia_semana,
        hora_inicio: d.hora_inicio,
        hora_fin: d.hora_fin,
        cancha: { id_cancha: idCancha } as any,
      }),
    );

    return this.disponibilidadRepository.save(nuevas);
  }

  update(id: number, updateDisponibilidadDto: UpdateDisponibilidadDto) {
    return this.disponibilidadRepository.update({ id_disponibilidad: id }, updateDisponibilidadDto);
  }

  remove(id: number) {
    return this.disponibilidadRepository.delete({ id_disponibilidad: id });
  }
}

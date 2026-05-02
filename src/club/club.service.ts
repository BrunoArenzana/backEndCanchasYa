import { Injectable } from '@nestjs/common';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './entities/club.entity';
import { DuenoCancha } from 'src/dueno_cancha/entities/dueno_cancha.entity';

@Injectable()
export class ClubService {
  constructor(
  @InjectRepository(Club)
  private clubRepository: Repository<Club>,

  @InjectRepository(DuenoCancha)
  private duenoRepository: Repository<DuenoCancha>,
) {}

  create(createClubDto: CreateClubDto) {
    const club = this.clubRepository.create(createClubDto);
    return this.clubRepository.save(club);
  }

  findAll() {
    return this.clubRepository.find();
  }

  findOne(id: number) {
    return this.clubRepository.findOneBy({ id_club: id });
  }

  update(id: number, updateClubDto: UpdateClubDto) {
    return this.clubRepository.update(id, updateClubDto);
  }

  remove(id: number) {
    return this.clubRepository.delete(id);
  }
  
  async createForOwner(idDueno: number, data: any) {
  const dueno = await this.duenoRepository.findOne({
    where: { id_dueno: idDueno }
  });

  if (!dueno) {
    throw new Error('Dueño no encontrado');
  }

  const club = this.clubRepository.create({
    nombre_club: data.razonSocial,
    direccion_club: data.direccion,
    ciudad_club: data.ciudad,
    telefono_club: data.telefono,
    dueno: dueno,
  });

  return this.clubRepository.save(club);
}
}

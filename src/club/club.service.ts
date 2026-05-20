import { Injectable } from '@nestjs/common';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './entities/club.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(Club)
    private clubRepository: Repository<Club>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  findByDueno(id_usuario: number) {
    return this.clubRepository.find({ where: { dueno: { id_usuario: id_usuario } } });
  }

  update(id: number, updateClubDto: UpdateClubDto) {
    return this.clubRepository.update(id, updateClubDto);
  }

  remove(id: number) {
    return this.clubRepository.delete(id);
  }
  
  async createForOwner(idUsuario: number, data: any) {
    const user = await this.userRepository.findOne({
      where: { id_usuario: idUsuario },
    });

    if (!user) {
      throw new Error('Usuario dueño no encontrado');
    }

    const club = this.clubRepository.create({
      nombre_club: data.razonSocial,
      direccion_club: data.direccion,
      ciudad_club: data.ciudad,
      telefono_club: data.telefono,
      dueno: user,
    });

    return this.clubRepository.save(club);
  }
}

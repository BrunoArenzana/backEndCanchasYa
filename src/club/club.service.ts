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
  async getPendientes() {
    const clubs = await this.clubRepository.find({
      where: { estado: 'pendiente_aprobacion' },
      relations: ['dueno']
    });
    return clubs.map(club => ({
      id: club.id_club,
      nombre: club.nombre_club,
      email: club.dueno?.email_usuario,
      telefono: club.telefono_club,
      canchas: club.deportes_club,
      direccion: club.direccion_club,
      activo: false
    }));
  }

  async getAceptados() {
    const clubs = await this.clubRepository.find({
      where: [
        { estado: 'activo' },
        { estado: 'inactivo' }
      ],
      relations: ['dueno', 'canchas', 'canchas.deporte']
    });
    return clubs.map(club => ({
      id: club.id_club,
      nombre: club.nombre_club,
      email: club.dueno?.email_usuario,
      telefono: club.telefono_club,
      canchas: club.deportes_club,
      direccion: club.direccion_club,
      logo: club.logo_club,
      activo: club.estado === 'activo',
      detallesCanchas: club.canchas?.map(cancha => ({
        id: cancha.id_cancha,
        nombre: cancha.nombre_cancha,
        precio: parseFloat(cancha.precio_por_hora as any) || 0,
        deporte: cancha.id_deporte?.nombre_deporte
      })) || []
    }));
  }

  async toggleStatus(id: number, activo: boolean) {
    const estado = activo ? 'activo' : 'inactivo';
    return this.clubRepository.update(id, { estado });
  }

  async aceptar(id: number) {
    return this.clubRepository.update(id, { estado: 'activo' });
  }

  async rechazar(id: number) {
    return this.clubRepository.delete(id);
  }
}

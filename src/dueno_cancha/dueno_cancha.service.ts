import { Injectable } from '@nestjs/common';
import { CreateDuenoCanchaDto } from './dto/create-dueno_cancha.dto';
import { UpdateDuenoCanchaDto } from './dto/update-dueno_cancha.dto';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DuenoCancha } from './entities/dueno_cancha.entity';
import { Club } from '../club/entities/club.entity';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class DuenoCanchaService {
  constructor(
    @InjectRepository(DuenoCancha)
    private duenoCanchaRepository: Repository<DuenoCancha>,

    @InjectRepository(Club)
    private clubRepository: Repository<Club>,

    private dataSource: DataSource,
  ) {}

  // ✅ CRUD original (NO lo borres)
  create(createDuenoCanchaDto: CreateDuenoCanchaDto) {
    const dueno = this.duenoCanchaRepository.create(createDuenoCanchaDto);
    return this.duenoCanchaRepository.save(dueno);
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

  // 🚀 MÉTODO NUEVO (el importante)
  async createDuenoWithClub(data: any) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dueno = queryRunner.manager.create(DuenoCancha, {
        nombre_dueno: data.nombre,
        apellido_dueno: data.apellido,
        email_dueno: data.email,
        password_dueno: data.password,
        telefono_dueno: data.telefono,
      });

      const savedDueno = await queryRunner.manager.save(dueno);

      const club = queryRunner.manager.create(Club, {
        nombre_club: data.razonSocial,
        direccion_club: data.direccion || 'sin direccion',
        ciudad_club: data.ciudad,
        telefono_club: data.telefono,
        dueno: savedDueno,
      });

      await queryRunner.manager.save(club);

      await queryRunner.commitTransaction();

      return {
        message: 'OK',
        dueno: savedDueno,
        club,
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async login(email: string, password: string) {
  const dueno = await this.duenoCanchaRepository.findOne({
    where: { email_dueno: email },
  });

  if (!dueno || dueno.password_dueno !== password) {
    throw new UnauthorizedException('Usuario o contraseña incorrectos');
  }

  return {
    message: 'Login exitoso',
    user: {
      id_dueno: dueno.id_dueno,
      nombre: dueno.nombre_dueno,
      apellido: dueno.apellido_dueno,
      email: dueno.email_dueno,
      tipo: 'club',
    },
  };
}
}
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CreateDuenoCanchaDto } from './dto/create-dueno_cancha.dto';
import { UpdateDuenoCanchaDto } from './dto/update-dueno_cancha.dto';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DuenoCancha } from './entities/dueno_cancha.entity';
import { Club } from '../club/entities/club.entity';
import { Cancha } from '../cancha/entities/cancha.entity';
import { Deporte } from '../deporte/entities/deporte.entity';

@Injectable()
export class DuenoCanchaService {
  constructor(
    @InjectRepository(DuenoCancha)
    private duenoCanchaRepository: Repository<DuenoCancha>,

    @InjectRepository(Club)
    private clubRepository: Repository<Club>,

    private dataSource: DataSource,
  ) {}

  create(createDuenoCanchaDto: CreateDuenoCanchaDto) {
    const dueno = this.duenoCanchaRepository.create(createDuenoCanchaDto);
    return this.duenoCanchaRepository.save(dueno);
  }

  findAll() {
    return this.duenoCanchaRepository.find({
      relations: ['clubs'],
    });
  }

  findOne(id: number) {
    return this.duenoCanchaRepository.findOne({
      where: { id_dueno: id },
      relations: ['clubs'],
    });
  }

  update(id: number, updateDuenoCanchaDto: UpdateDuenoCanchaDto) {
    return this.duenoCanchaRepository.update(
      { id_dueno: id },
      updateDuenoCanchaDto,
    );
  }

  remove(id: number) {
    return this.duenoCanchaRepository.delete({ id_dueno: id });
  }

  async createDuenoWithClub(data: any, file?: any) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const deportesSeleccionados: string[] = data.canchas
        ? JSON.parse(data.canchas)
        : [];

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
        deportes_club: deportesSeleccionados,
        logo_club: file ? `/uploads/${file.filename}` : undefined,
        dueno: savedDueno,
      });

      const savedClub = await queryRunner.manager.save(club);

      for (const nombreDeporte of deportesSeleccionados) {
        const deporte = await queryRunner.manager.findOne(Deporte, {
          where: { nombre_deporte: nombreDeporte },
        });

        if (!deporte) {
          throw new BadRequestException(
            `El deporte "${nombreDeporte}" no existe en la base de datos`,
          );
        }

        const cancha = queryRunner.manager.create(Cancha, {
          nombre_cancha: `Cancha ${nombreDeporte}`,
          descripcion_cancha: `Cancha de ${nombreDeporte} del club ${savedClub.nombre_club}`,
          precio_por_hora: 0,
          activa: 1,
          club: savedClub,
          deporte,
        });

        await queryRunner.manager.save(cancha);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Dueño, club y canchas creados correctamente',
        dueno: savedDueno,
        club: savedClub,
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
      relations: ['clubs'],
    });

    if (!dueno || dueno.password_dueno !== password) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const clubPrincipal = dueno.clubs?.[0] || null;

    return {
      message: 'Login exitoso',
      user: {
        id_dueno: dueno.id_dueno,
        nombre: dueno.nombre_dueno,
        apellido: dueno.apellido_dueno,
        email: dueno.email_dueno,
        tipo: 'club',
        club: clubPrincipal,
      },
    };
  }
}
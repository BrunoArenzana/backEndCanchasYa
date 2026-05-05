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
      console.log('Datos recibidos:', data);
      console.log('Archivo recibido:', file);

      // Parsear canchas seleccionadas
      let deportesSeleccionados: string[] = [];
      if (data.canchas) {
        try {
          deportesSeleccionados = typeof data.canchas === 'string' 
            ? JSON.parse(data.canchas) 
            : data.canchas;
        } catch (e) {
          console.warn('No se pudieron parsear canchas:', e);
          deportesSeleccionados = [];
        }
      }

      // Crear DuenoCancha
      const dueno = queryRunner.manager.create(DuenoCancha, {
        nombre_dueno: data.nombre,
        apellido_dueno: data.apellido,
        email_dueno: data.email,
        password_dueno: data.password,
        telefono_dueno: data.telefono,
      });

      const savedDueno = await queryRunner.manager.save(dueno);
      console.log('Dueño creado:', savedDueno.id_dueno);

      // Crear Club
      const club = queryRunner.manager.create(Club, {
        nombre_club: data.razonSocial,
        direccion_club: data.direccion || data.ciudad || 'sin dirección especificada',
        ciudad_club: data.ciudad,
        telefono_club: data.telefono,
        logo_club: file ? `/uploads/${file.filename}` : undefined,
        deportes_club: deportesSeleccionados,
        dueno: savedDueno,
        estado: 'pendiente_aprobacion',
      });

      const savedClub = await queryRunner.manager.save(club);
      console.log('Club creado:', savedClub.id_club);

      // Crear canchas para cada deporte seleccionado
      if (deportesSeleccionados.length > 0) {
        for (const nombreDeporte of deportesSeleccionados) {
          const deporte = await queryRunner.manager.findOne(Deporte, {
            where: { nombre_deporte: nombreDeporte },
          });

          if (!deporte) {
            console.warn(`Deporte "${nombreDeporte}" no encontrado, creando genérico...`);
            // No lanzar error, simplemente crear una cancha genérica
            const cancha = queryRunner.manager.create(Cancha, {
              nombre_cancha: `${nombreDeporte}`,
              descripcion_cancha: `Cancha de ${nombreDeporte} del club ${savedClub.nombre_club}`,
              precio_por_hora: 0,
              club: savedClub,
            });
            await queryRunner.manager.save(cancha);
          } else {
            const cancha = queryRunner.manager.create(Cancha, {
              nombre_cancha: `${nombreDeporte}`,
              descripcion_cancha: `Cancha de ${nombreDeporte} del club ${savedClub.nombre_club}`,
              precio_por_hora: 0,
              club: savedClub,
              deporte,
            });
            await queryRunner.manager.save(cancha);
          }
        }
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Dueño y club creados correctamente. Espera la aprobación del administrador.',
        dueno: savedDueno,
        club: savedClub,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error en createDuenoWithClub:', error);
      throw new BadRequestException(
        `Error al registrar: ${'Error desconocido'}`
      );
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
        id_club: dueno.clubs?.[0]?.id_club || null,
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
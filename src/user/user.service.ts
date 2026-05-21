import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Club } from '../club/entities/club.entity';
import { Cancha } from '../cancha/entities/cancha.entity';
import { Deporte } from '../deporte/entities/deporte.entity';
import { Repository, DataSource } from 'typeorm';



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Club)
    private clubRepository: Repository<Club>,

    private dataSource: DataSource,
  ) {}

  create(createUserDto: CreateUserDto) {
    const tipo = (createUserDto.tipo_usuario || 'usuario').toString();
    const estado = tipo === 'usuario' ? 'activo' : 'pendiente_aprobacion';

    const user = this.userRepository.create({
      ...createUserDto,
      tipo_usuario: tipo,
      estado_usuario: estado,
    });

    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find({
      relations: ['clubs'],
    });
  }

  findOne(id: number) {
    return this.userRepository.findOne({
      where: { id_usuario: id },
      relations: ['clubs'],
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(
      { id_usuario: id },
      updateUserDto,
    );
  }

  remove(id: number) {
    return this.userRepository.delete({ id_usuario: id });
  }

  async createWithClub(data: any, file?: any) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      //EVITA EL ARRAY DE CUIT EN EL FORMULARIO, QUE VIENE COMO UN ARRAY
      const normalize = (v: any) => (Array.isArray(v) ? v[0] : v);

      const canchasRaw = normalize(data.canchas);

      /*// Reject array values for scalar fields that must be single-valued in the form.
      if (Array.isArray(data.CUIT) || Array.isArray(data.cuit)) {
        throw new BadRequestException('El campo CUIT debe enviarse como un único valor, no como un arreglo. Revisa el formulario.');
      }*/
      const deportesSeleccionados: string[] = canchasRaw
        ? JSON.parse(canchasRaw)
        : [];

      const user = queryRunner.manager.create(User, {
        nombre_usuario: (data.nombre),
        apellido_usuario: (data.apellido),
        email_usuario: (data.email),
        password_usuario: (data.password),
        telefono_usuario: (data.telefono),
        dni_usuario: (data.DNI) || (data.dni) || null,
        CUIT_usuario: normalize(data.CUIT) || normalize(data.cuit) || null,
        direccion_usuario:(data.direccion) || 'sin direccion',
        ciudad_usuario: (data.ciudad),
        provincia_usuario: (data.provincia),
        cp_usuario: (data.cp),
        tipo_usuario: (data.tipo) || 'dueno',
      });

      const savedUser = await queryRunner.manager.save(user);

      const club = queryRunner.manager.create(Club, {
        nombre_club: normalize(data.razonSocial) || normalize(data.nombreClub) || 'Sin nombre',
        direccion_club: normalize(data.direccion) || 'sin direccion',
        ciudad_club: normalize(data.ciudad),
        provincia_club: normalize(data.provincia),
        cp_club: normalize(data.cp),
        telefono_club: normalize(data.telefono),
        deportes_club: deportesSeleccionados,
        logo_club: file ? `/uploads/${file.filename}` : undefined,
        dueno: savedUser,
      });

      const savedClub = await queryRunner.manager.save(club);

      for (const nombreDeporte of deportesSeleccionados) {
        let deporte = await queryRunner.manager.findOne(Deporte, {
          where: { nombre_deporte: nombreDeporte },
        });

        if (!deporte) {
          // Si el deporte no existe, lo creamos automáticamente para facilitar el registro.
          const nuevoDeporte = queryRunner.manager.create(Deporte, {
            nombre_deporte: nombreDeporte,
          });

          await queryRunner.manager.save(nuevoDeporte);
          deporte = nuevoDeporte;
        }

        const cancha = queryRunner.manager.create(Cancha, {
          nombre_cancha: `Cancha ${nombreDeporte}`,
          descripcion_cancha: `Cancha de ${nombreDeporte} del club ${savedClub.nombre_club}`,
          precio_por_hora: 0,
          activa: 1,
          direccion_cancha: data.direccion || 'sin direccion',
          ciudad_cancha: data.ciudad,
          provincia_cancha: data.provincia,
          cp_cancha: data.cp,
          club: savedClub,
          deporte,
        });

        await queryRunner.manager.save(cancha);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Dueño, club y canchas creados correctamente',
        dueno: savedUser,
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
    const user = await this.userRepository.findOne({
      where: { email_usuario: email },
      relations: ['clubs'],
    });

    if (!user || user.password_usuario !== password) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const clubPrincipal = user.clubs?.[0] || null;

    return {
      message: 'Login exitoso',
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre_usuario,
        apellido: user.apellido_usuario,
        email: user.email_usuario,
        tipo: user.tipo_usuario === 'dueno' ? 'club' : user.tipo_usuario,
        club: clubPrincipal,
      },
    };
  }
}
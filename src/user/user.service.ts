import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
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

  async create(createUserDto: CreateUserDto) {
    try {
      if (createUserDto.email_usuario) {
        const existingEmail = await this.userRepository.findOne({
          where: { email_usuario: createUserDto.email_usuario },
        });

        if (existingEmail) {
          throw new BadRequestException('El email ya está registrado');
        }
      }

      if (createUserDto.dni_usuario) {
        const existingDni = await this.userRepository.findOne({
          where: { dni_usuario: createUserDto.dni_usuario },
        });

        if (existingDni) {
          throw new BadRequestException('El DNI ya está registrado');
        }
      }

      if (createUserDto.CUIT_usuario) {
        const existingCuit = await this.userRepository.findOne({
          where: { CUIT_usuario: createUserDto.CUIT_usuario },
        });

        if (existingCuit) {
          throw new BadRequestException('El CUIT ya está registrado');
        }
      }

      const tipo = (createUserDto.tipo_usuario || 'usuario').toString();

      const estado =
        tipo === 'usuario'
          ? 'activo'
          : tipo === 'dueno'
          ? 'pendiente_aprobacion'
          : 'activo';

      const user = this.userRepository.create({
        ...createUserDto,
        tipo_usuario: tipo,
        estado_usuario: estado,
      });

      const saved = await this.userRepository.save(user);

      return {
        id_usuario: saved.id_usuario,
        nombre_usuario: saved.nombre_usuario,
        apellido_usuario: saved.apellido_usuario,
        email_usuario: saved.email_usuario,
        tipo_usuario: saved.tipo_usuario,
        estado_usuario: saved.estado_usuario,
        created_at: saved.created_at,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Error al crear usuario');
    }
  }

  async countRegisteredUsers() {
    const total = await this.userRepository.count({
      where: {
        tipo_usuario: 'usuario',
        estado_usuario: 'activo',
      },
    });

    return {
      total,
    };
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
    return this.userRepository.update({ id_usuario: id }, updateUserDto);
  }

  remove(id: number) {
    return this.userRepository.delete({ id_usuario: id });
  }

  async createWithClub(data: any, file?: any) {
    if (data.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email_usuario: data.email },
      });

      if (existingEmail) {
        throw new BadRequestException('El email ya está registrado');
      }
    }

    const normalizedCuit = (data.CUIT || data.cuit || '').toString().trim();

    if (normalizedCuit) {
      const existingCuit = await this.userRepository.findOne({
        where: { CUIT_usuario: normalizedCuit },
      });

      if (existingCuit) {
        throw new BadRequestException('El CUIT ya está registrado');
      }
    }

    const normalizedDni = (data.DNI || data.dni || '').toString().trim();

    if (normalizedDni) {
      const existingDni = await this.userRepository.findOne({
        where: { dni_usuario: normalizedDni },
      });

      if (existingDni) {
        throw new BadRequestException('El DNI ya está registrado');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const normalize = (v: any) => (Array.isArray(v) ? v[0] : v);

      const canchasRaw = normalize(data.canchas);

      const deportesSeleccionados: string[] = canchasRaw
        ? JSON.parse(canchasRaw)
        : [];

      const user = queryRunner.manager.create(User, {
        nombre_usuario: data.nombre,
        apellido_usuario: data.apellido,
        email_usuario: data.email,
        password_usuario: data.password,
        telefono_usuario: data.telefono,
        dni_usuario: data.DNI || data.dni || null,
        CUIT_usuario: normalize(data.CUIT) || normalize(data.cuit) || null,
        direccion_usuario: data.direccion || 'sin direccion',
        ciudad_usuario: data.ciudad,
        provincia_usuario: data.provincia,
        cp_usuario: data.cp,
        tipo_usuario: data.tipo || 'dueno',
      });

      const savedUser = await queryRunner.manager.save(user);

      const club = queryRunner.manager.create(Club, {
        nombre_club:
          normalize(data.razonSocial) || normalize(data.nombreClub) || 'Sin nombre',
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
          id_club: savedClub,
          id_deporte: deporte,
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

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email_usuario: email },
    });
  }

  async savePasswordResetCode(
    email: string,
    code: string,
    expiresAt: Date,
  ) {
    await this.userRepository.update(
      { email_usuario: email },
      {
        password_reset_code: code,
        password_reset_expires: expiresAt,
      },
    );

    return {
      message: 'Código de recuperación generado correctamente',
    };
  }

  async resetPasswordWithCode(
    email: string,
    code: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (!email || !code || !newPassword || !confirmPassword) {
      throw new BadRequestException('Todos los campos son obligatorios.');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres.');
    }

    const user = await this.userRepository.findOne({
      where: { email_usuario: email },
    });

    if (!user || !user.password_reset_code || !user.password_reset_expires) {
      throw new BadRequestException('Código inválido o vencido.');
    }

    const ahora = new Date();

    if (user.password_reset_code !== code) {
      throw new BadRequestException('Código inválido o vencido.');
    }

    if (user.password_reset_expires < ahora) {
      throw new BadRequestException('Código inválido o vencido.');
    }

    user.password_usuario = newPassword;
    user.password_reset_code = null;
    user.password_reset_expires = null;

    await this.userRepository.save(user);

    return {
      message: 'Contraseña actualizada correctamente.',
    };
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
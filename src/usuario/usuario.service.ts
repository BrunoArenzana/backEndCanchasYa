import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  create(createUsuarioDto: CreateUsuarioDto) {
    const usuario = this.usuarioRepository.create(createUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async login(email: string, password: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email_usuario: email },
    });

    if (!usuario || usuario.password_usuario !== password) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    return {
      message: 'Login exitoso',
      user: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre_usuario,
        apellido: usuario.apellido_usuario,
        email: usuario.email_usuario,
        telefono: usuario.telefono_usuario,
        dni: usuario.dni_usuario,
        ciudad: usuario.ciudad_usuario,
        provincia: usuario.provincia_usuario,
        cp: usuario.cp_usuario,
        tipo: 'usuario',
      },
    };
  }

  findAll() {
    return this.usuarioRepository.find();
  }

  findOne(id: number) {
    return this.usuarioRepository.findOneBy({ id_usuario: id });
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioRepository.update({ id_usuario: id }, updateUsuarioDto);
  }

  remove(id: number) {
    return this.usuarioRepository.delete({ id_usuario: id });
  }
}
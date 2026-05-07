import { Injectable } from '@nestjs/common';
import { DuenoCanchaService } from '../dueno_cancha/dueno_cancha.service';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from 'src/usuario/usuario.service';

// import { UsuarioService } from '../usuario/usuario.service'; // Descomentar cuando lo integr
@Injectable()
export class AuthService {
  constructor(
    private readonly duenoCanchaService: DuenoCanchaService,
    private readonly jwtService: JwtService, // Para generar tokens JWT 
    private readonly usuarioService: UsuarioService
  ) {}

  async registerUsuario(dto: any) {
    return this.usuarioService.create(dto);
  }

  async loginUsuario(dto: any) {
  const result = await this.usuarioService.login(dto.email, dto.password);
  
  const payload = { 
    email: result.user.email, 
    sub: result.user.id_usuario,
    tipo: 'usuario'
  };
  const token = await this.jwtService.signAsync(payload);
  
  return {
    ...result,
    token,
  };
}

  async registerDuenoCancha(dto: any, file?: any) {
    return this.duenoCanchaService.createDuenoWithClub(dto, file);
  }

async loginDuenoCancha(dto: any) {
  const result = await this.duenoCanchaService.login(dto.email, dto.password);
  
  const payload = { 
    email: result.user.email, 
    sub: result.user.id_dueno,
    tipo: 'owner'
  };
  const token = await this.jwtService.signAsync(payload);
  
  return {
    ...result,
    token,
  };
}
}
  // const payload = { email: user.email}; // sub es un estándar para el ID del usuario
  // const token = this.jwtService.signAsync(payload); //puede ser sync o async, el async devuelve una promesa
  // return user;
  

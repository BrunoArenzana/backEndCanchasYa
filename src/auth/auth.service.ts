
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const result = await this.userService.login(email, password);

    const payload = {
      sub: result.user.id_usuario,
      email: result.user.email,
      tipo: result.user.tipo,
      role: result.user.tipo, // Asumiendo que el tipo de usuario también define su rol
    };

    const token = await this.jwtService.signAsync(payload);

    return { ...result, token };
  }

  async registerUsuario(dto: any) {
    return this.userService.create(dto);
  }

  async registerDueno(dto: any, file?: any) {
    return this.userService.createWithClub(dto, file);
  }
}
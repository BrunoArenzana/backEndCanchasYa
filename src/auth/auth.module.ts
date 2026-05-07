import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DuenoCanchaModule } from '../dueno_cancha/dueno_cancha.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';
import { UsuarioModule } from 'src/usuario/usuario.module';

// import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    DuenoCanchaModule,UsuarioModule,     JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },//tiempo de exp, el del curso le puso 1 dia "1d"
    }),
    // UsuarioModule 
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
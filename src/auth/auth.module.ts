import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DuenoCanchaModule } from '../dueno_cancha/dueno_cancha.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { AdminModule } from 'src/admin/admin.module';

// import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    DuenoCanchaModule,UsuarioModule,AdminModule,     JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },//tiempo de exp del token, modificarlo se según lo que necesiten, 60s es solo para pruebas
    }),
    // UsuarioModule 
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
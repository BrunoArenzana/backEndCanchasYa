import { Controller, Post, Body, UseInterceptors, UploadedFile, Get, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { AuthGuard } from './guard/auth.guard';
import { Request } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}



  // RUTAS PARA USUARIOS NORMALES (Jugadores)

  @Post('usuario/register')
  registerUser(@Body() bodyDelFront: any) {
    // Aquí recibes los datos del usuario común y los pasas al servicio
    return this.authService.registerUsuario(bodyDelFront);
  }

  @Post('usuario/login')
  loginUser(@Body() loginData: any) {
    // Recibe email y password del usuario común
    return this.authService.loginUsuario(loginData);
  }



  // RUTAS PARA DUEÑOS DE CANCHA Y CLUBES

  @Post('dueno-cancha/register')
  @UseInterceptors(FileInterceptor('logo')) // Busca el archivo llamado 'logo' en el FormData
  registerOwner(
    @Body() bodyDelFront: any, // Atrapa todos los campos de texto (nombre, canchas, etc.)
    @UploadedFile() file: any    // Atrapa la imagen adjunta
  ) { 
    // Le pasamos la data y el archivo al servicio para que haga la transacción
    return this.authService.registerDuenoCancha(bodyDelFront, file);
  }

  @Post('dueno-cancha/login')
  loginOwner(@Body() loginData: any) {
    // Recibe email y password del dueño
    return this.authService.loginDuenoCancha(loginData);
  }
  // RUTA PROTEGIDA DE EJEMPLO, ES UN EJEMPLO DE CÓMO USAR EL GUARD PARA PROTEGER RUTAS QUE REQUIERAN AUTENTICACIÓN
  @Get('profile')
  @UseGuards(AuthGuard) // Protegemos esta ruta con el guard de autenticación
  profile(
    @Request()
    req,
  ) {
    return req.user; // Aquí podrías retornar el perfil del usuario autenticado, que el guard ha adjuntado al request
    // Lógica para obtener el perfil del usuario
  }
//ruta admin
@Post('admin/login')
loginAdmin(@Body() loginData: any) {
  return this.authService.loginAdmin(loginData);
}
}
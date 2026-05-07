import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';

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
}
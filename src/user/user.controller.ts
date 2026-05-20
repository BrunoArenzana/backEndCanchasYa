import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DuenoCanchaService } from './dueno_cancha.service';
import { CreateDuenoCanchaDto } from './dto/create-dueno_cancha.dto';
import { UpdateDuenoCanchaDto } from './dto/update-dueno_cancha.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { UseGuards } from '@nestjs/common';



@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('register')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  createWithClub(@Body() body: any, @UploadedFile() file: any) {
    return this.userService.createWithClub(body, file);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.userService.login(body.email, body.password);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get('pendientes')
  getPendientes() {
    return this.duenoCanchaService.getPendientes();
  }

  @Get('aceptados')
  getAceptados() {
    return this.duenoCanchaService.getAceptados();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Put(':id/aceptar')
  aceptarClub(@Param('id') id: string) {
    return this.duenoCanchaService.aceptarClub(+id);
  }

  @Put(':id/rechazar')
  rechazarClub(@Param('id') id: string) {
    return this.duenoCanchaService.rechazarClub(+id);
  }

  @Put(':id/toggle-status')
  toggleStatus(@Param('id') id: string, @Body('activo') activo: boolean) {
    return this.duenoCanchaService.toggleStatus(+id, activo);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateDuenoCanchaDto: UpdateDuenoCanchaDto) {
    return this.duenoCanchaService.update(+id, updateDuenoCanchaDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
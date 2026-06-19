import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ClubService } from './club.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('club')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Post()
  create(@Body() createClubDto: CreateClubDto) {
    return this.clubService.create(createClubDto);
  }

  @Post('dueno/:idDueno')
  createForOwner(@Param('idDueno') idDueno: string, @Body() body: any) {
    return this.clubService.createForOwner(+idDueno, body);
  }

  @Get('pendientes')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  getPendientes() {
    return this.clubService.getPendientes();
  }

  @Get('aceptados')
  @UseGuards(AuthGuard)
  getAceptados() {
    return this.clubService.getAceptados();
  }

  @Get('dueno/:id_dueno')
  findByDueno(@Param('id_dueno') id_dueno: string) {
    return this.clubService.findByDueno(+id_dueno);
  }

  @Get()
  findAll() {
    return this.clubService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubService.findOne(+id);
  }

  @Put(':id/toggle-status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  toggleStatus(@Param('id') id: string, @Body('activo') activo: boolean) {
    return this.clubService.toggleStatus(+id, activo);
  }

  @Put(':id/aceptar')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  aceptar(@Param('id') id: string) {
    return this.clubService.aceptar(+id);
  }

  @Put(':id/rechazar')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  rechazar(@Param('id') id: string) {
    return this.clubService.rechazar(+id);
  }

  @Patch(':id/logo')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('dueno', 'admin', 'club')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/clubs',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new Error('Solo se permiten imágenes JPG, PNG o WEBP.'),
            false,
          );
        }

        callback(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  updateLogo(@Param('id') id: string, @UploadedFile() file: any) {
    return this.clubService.updateLogo(+id, file);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('dueno', 'admin', 'club')
  update(@Param('id') id: string, @Body() updateClubDto: UpdateClubDto) {
    return this.clubService.update(+id, updateClubDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('dueno', 'admin', 'club')
  remove(@Param('id') id: string) {
    return this.clubService.remove(+id);
  }
}
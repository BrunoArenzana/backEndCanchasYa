import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { AuthGuard } from '../auth/guard/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import { CreateTorneoDto } from './dto/create-torneo.dto';
import { UpdateEstadoTorneoDto } from './dto/update-estado-torneo.dto';
import { UpdateTorneoDto } from './dto/update-torneo.dto';
import {
  TorneoService,
  UsuarioAutenticadoTorneo,
} from './torneo.service';

type RequestAutenticada = Request & {
  user: UsuarioAutenticadoTorneo;
};

const configuracionFlyer = {
  storage: diskStorage({
    destination: (
      req: Request,
      file: any,
      callback: (error: Error | null, destination: string) => void,
    ) => {
      const destino = './uploads/torneos';
      mkdirSync(destino, { recursive: true });
      callback(null, destino);
    },
    filename: (
      req: Request,
      file: any,
      callback: (error: Error | null, filename: string) => void,
    ) => {
      const nombreUnico = `${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}${extname(file.originalname).toLowerCase()}`;

      callback(null, nombreUnico);
    },
  }),
  fileFilter: (
    req: Request,
    file: any,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!tiposPermitidos.includes(file.mimetype)) {
      return callback(
        new Error('El flyer debe ser una imagen JPG, PNG o WEBP.'),
        false,
      );
    }

    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};

@Controller('torneo')
export class TorneoController {
  constructor(private readonly torneoService: TorneoService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('club', 'dueno', 'admin')
  @UseInterceptors(FileInterceptor('flyer', configuracionFlyer))
  create(
    @Body() dto: CreateTorneoDto,
    @UploadedFile() file: any,
    @Req() request: RequestAutenticada,
  ) {
    return this.torneoService.create(dto, file, request.user);
  }

  @Get('publicados')
  findPublicados() {
    return this.torneoService.findPublicados();
  }

  @Get('club/:idClub')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('club', 'dueno', 'admin')
  findByClub(
    @Param('idClub', ParseIntPipe) idClub: number,
    @Req() request: RequestAutenticada,
  ) {
    return this.torneoService.findByClub(idClub, request.user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: RequestAutenticada,
  ) {
    return this.torneoService.findOne(id, request.user);
  }

  @Patch(':id/estado')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('club', 'dueno', 'admin')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoTorneoDto,
    @Req() request: RequestAutenticada,
  ) {
    return this.torneoService.updateEstado(id, dto, request.user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('club', 'dueno', 'admin')
  @UseInterceptors(FileInterceptor('flyer', configuracionFlyer))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTorneoDto,
    @UploadedFile() file: any,
    @Req() request: RequestAutenticada,
  ) {
    return this.torneoService.update(id, dto, file, request.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('club', 'dueno', 'admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: RequestAutenticada,
  ) {
    return this.torneoService.remove(id, request.user);
  }
}

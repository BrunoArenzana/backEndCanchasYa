import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/guard/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { ReservaService } from './reserva.service';

@Controller('reserva')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservaService.create(createReservaDto);
  }

  @Get()
  findAll() {
    return this.reservaService.findAll();
  }

  @Get('usuario/:idUsuario')
  @UseGuards(AuthGuard)
  findByUsuario(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
  ) {
    return this.reservaService.findByUsuario(idUsuario);
  }

  @Get('club/:idClub')
  @UseGuards(AuthGuard)
  findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.reservaService.findByClub(idClub);
  }

  /*
   * Devuelve únicamente los turnos ocupados para una cancha y fecha.
   * No expone datos personales de otros usuarios.
   */
  @Get('disponibilidad/:idCancha/:fecha')
  @UseGuards(AuthGuard)
  findDisponibilidad(
    @Param('idCancha', ParseIntPipe) idCancha: number,
    @Param('fecha') fecha: string,
  ) {
    const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fecha);

    if (!fechaValida) {
      throw new BadRequestException(
        'La fecha debe tener el formato YYYY-MM-DD.',
      );
    }

    return this.reservaService.findDisponibilidad(idCancha, fecha);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: number) {
    const numericId = +id;

    if (Number.isNaN(numericId)) {
      throw new BadRequestException('ID inválido');
    }

    return this.reservaService.findOne(numericId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: number,
    @Body() updateReservaDto: UpdateReservaDto,
  ) {
    const numericId = +id;

    if (Number.isNaN(numericId)) {
      throw new BadRequestException('ID inválido');
    }

    return this.reservaService.update(numericId, updateReservaDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('usuario', 'admin')
  remove(@Param('id') id: number) {
    const numericId = +id;

    if (Number.isNaN(numericId)) {
      throw new BadRequestException('ID inválido');
    }

    return this.reservaService.remove(numericId);
  }
}
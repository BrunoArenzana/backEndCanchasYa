import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';

@Controller('reserva')
// @UseGuards(RolesGuard)
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  @UseGuards(AuthGuard)//solo los usuarios autenticados pueden crear reservas
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservaService.create(createReservaDto);
  }

  @Get()
  findAll() {
    return this.reservaService.findAll();
  }

  @Get('usuario/:idUsuario')
  @UseGuards(AuthGuard) //solo los usuarios autenticados pueden ver sus reservas
  findByUsuario(@Param('idUsuario') idUsuario: string) {
    return this.reservaService.findByUsuario(+idUsuario);
  }

  @Get('club/:idClub')
  @UseGuards(AuthGuard) //solo los usuarios autenticados pueden ver reservas por club
  findByClub(@Param('idClub') idClub: string) {
    return this.reservaService.findByClub(+idClub);
  }

  @Get(':id')
  @UseGuards(AuthGuard) //solo los usuarios autenticados pueden ver una reserva específica
  findOne(@Param('id') id: string) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('ID inválido');
    return this.reservaService.findOne(numericId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard) //solo los usuarios autenticados pueden actualizar reservas
  update(@Param('id') id: string, @Body() updateReservaDto: UpdateReservaDto) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('ID inválido');
    return this.reservaService.update(numericId, updateReservaDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard) //solo los usuarios autenticados con rol admin pueden eliminar reservas
  @Roles('usuario', 'admin')
  remove(@Param('id') id: string) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('ID inválido');
    return this.reservaService.remove(numericId);
  }

}
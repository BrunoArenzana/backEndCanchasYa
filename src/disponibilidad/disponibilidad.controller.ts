import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { DisponibilidadService } from './disponibilidad.service';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('disponibilidad')
export class DisponibilidadController {
  constructor(private readonly disponibilidadService: DisponibilidadService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('dueno', 'admin', 'club')
  create(@Body() createDisponibilidadDto: CreateDisponibilidadDto) {
    return this.disponibilidadService.create(createDisponibilidadDto);
  }

  @Get()
  findAll() {
    return this.disponibilidadService.findAll();
  }

  @Get('cancha/:idCancha')
  findByCancha(@Param('idCancha') idCancha: string) {
    return this.disponibilidadService.findByCancha(+idCancha);
  }

  @Put('cancha/:idCancha')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('dueno', 'admin', 'club')
  replaceForCancha(
    @Param('idCancha') idCancha: string,
    @Body() disponibilidades: { dia_semana: number; hora_inicio: string; hora_fin: string }[],
  ) {
    return this.disponibilidadService.replaceForCancha(+idCancha, disponibilidades);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disponibilidadService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('dueno', 'admin', 'club')
  update(@Param('id') id: string, @Body() updateDisponibilidadDto: UpdateDisponibilidadDto) {
    return this.disponibilidadService.update(+id, updateDisponibilidadDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('dueno', 'admin', 'club')
  remove(@Param('id') id: string) {
    return this.disponibilidadService.remove(+id);
  }
}

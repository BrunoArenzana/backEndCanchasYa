import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CanchaService } from './cancha.service';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto } from './dto/update-cancha.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@Controller('cancha')
export class CanchaController {
  constructor(private readonly canchaService: CanchaService) { }

  @Get()
  @UseGuards(AuthGuard) //solo los usuarios autenticados pueden ver canchas
  findAll() {
    return this.canchaService.findAll();
  }

  @Get('club/:idClub')
    @UseGuards(AuthGuard)
  findByClub(@Param('idClub') idClub: string) {
    return this.canchaService.findByClub(+idClub);
  }

  @Get(':id')
    @UseGuards(AuthGuard) //solo los usuarios autenticados pueden ver detalles de una cancha
  findOne(@Param('id') id: string) {
    return this.canchaService.findOne(+id);
  }

  @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('dueno', 'club') //solo los dueños y admins pueden crear canchas
  create(@Body() createCanchaDto: CreateCanchaDto) {
    return this.canchaService.create(createCanchaDto);
  }
  
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('dueno', 'admin', 'club') //solo los dueños y admins pueden actualizar canchas
  update(@Param('id') id: string, @Body() updateCanchaDto: UpdateCanchaDto) {
    return this.canchaService.update(+id, updateCanchaDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('dueno', 'admin', 'club') //solo los dueños y admins pueden eliminar canchas
  remove(@Param('id') id: string) {
    return this.canchaService.remove(+id);
  }
}
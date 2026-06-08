import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ClubService } from './club.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { get } from 'http';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@Controller('club')
export class ClubController {
  constructor(private readonly clubService: ClubService) { }

  @Post()//revisar si necesita auth guard
  create(@Body() createClubDto: CreateClubDto) {
    return this.clubService.create(createClubDto);
  }

  @Post('dueno/:idDueno')
    //@UseGuards(AuthGuard)
  createForOwner(
    @Param('idDueno') idDueno: string,
    @Body() body: any
  ) {
    return this.clubService.createForOwner(+idDueno, body);
  }

  @Get('pendientes')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin') //solo los admins pueden ver clubes pendientes
  getPendientes() {
    return this.clubService.getPendientes();
  }

  @Get('aceptados')
  @UseGuards(AuthGuard)
  getAceptados() {
    return this.clubService.getAceptados();
  }

  @Get()
  findAll() {
    return this.clubService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubService.findOne(+id);
  }
  @Get('dueno/:id_dueno')
  findByDueno(@Param('id_dueno') id_dueno: string) {
    return this.clubService.findByDueno(+id_dueno);
  }

  @Put(':id/toggle-status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin') //solo los admins pueden activar/desactivar clubes
  toggleStatus(@Param('id') id: string, @Body('activo') activo: boolean) {
    return this.clubService.toggleStatus(+id, activo);
  }

  @Put(':id/aceptar')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin') //solo los admins pueden aceptar clubes
  aceptar(@Param('id') id: string) {
    return this.clubService.aceptar(+id);
  }

  @Put(':id/rechazar')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin') //solo los admins pueden rechazar clubes
  rechazar(@Param('id') id: string) {
    return this.clubService.rechazar(+id);
  }


  @Patch(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('dueno', 'admin', 'club') //solo los dueños y admins pueden actualizar clubes
  update(@Param('id') id: string, @Body() updateClubDto: UpdateClubDto) {
    return this.clubService.update(+id, updateClubDto);
  }

  @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('dueno', 'admin', 'club') //solo los dueños y admins pueden eliminar clubes
  remove(@Param('id') id: string) {
    return this.clubService.remove(+id);
  }
}

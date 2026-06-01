import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ClubService } from './club.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { get } from 'http';

@Controller('club')
export class ClubController {
  constructor(private readonly clubService: ClubService) { }

  @Post()
  create(@Body() createClubDto: CreateClubDto) {
    return this.clubService.create(createClubDto);
  }

  @Post('dueno/:idDueno')
  createForOwner(
    @Param('idDueno') idDueno: string,
    @Body() body: any
  ) {
    return this.clubService.createForOwner(+idDueno, body);
  }

  @Get('pendientes')
  getPendientes() {
    return this.clubService.getPendientes();
  }

  @Get('aceptados')
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
  toggleStatus(@Param('id') id: string, @Body('activo') activo: boolean) {
    return this.clubService.toggleStatus(+id, activo);
  }

  @Put(':id/aceptar')
  aceptar(@Param('id') id: string) {
    return this.clubService.aceptar(+id);
  }

  @Put(':id/rechazar')
  rechazar(@Param('id') id: string) {
    return this.clubService.rechazar(+id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClubDto: UpdateClubDto) {
    return this.clubService.update(+id, updateClubDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clubService.remove(+id);
  }
}

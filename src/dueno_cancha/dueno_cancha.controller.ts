import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DuenoCanchaService } from './dueno_cancha.service';
import { CreateDuenoCanchaDto } from './dto/create-dueno_cancha.dto';
import { UpdateDuenoCanchaDto } from './dto/update-dueno_cancha.dto';

@Controller('dueno-cancha')
export class DuenoCanchaController {
  constructor(private readonly duenoCanchaService: DuenoCanchaService) {}

  @Post()
  create(@Body() createDuenoCanchaDto: CreateDuenoCanchaDto) {
    return this.duenoCanchaService.create(createDuenoCanchaDto);
  }

  @Get()
  findAll() {
    return this.duenoCanchaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.duenoCanchaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDuenoCanchaDto: UpdateDuenoCanchaDto) {
    return this.duenoCanchaService.update(+id, updateDuenoCanchaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.duenoCanchaService.remove(+id);
  }
}

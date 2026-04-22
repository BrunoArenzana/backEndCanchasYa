import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeporteService } from './deporte.service';
import { CreateDeporteDto } from './dto/create-deporte.dto';
import { UpdateDeporteDto } from './dto/update-deporte.dto';

@Controller('deporte')
export class DeporteController {
  constructor(private readonly deporteService: DeporteService) {}

  @Post()
  create(@Body() createDeporteDto: CreateDeporteDto) {
    return this.deporteService.create(createDeporteDto);
  }

  @Get()
  findAll() {
    return this.deporteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deporteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeporteDto: UpdateDeporteDto) {
    return this.deporteService.update(+id, updateDeporteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deporteService.remove(+id);
  }
}

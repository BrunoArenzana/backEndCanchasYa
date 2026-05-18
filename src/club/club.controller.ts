import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClubService } from './club.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { get } from 'http';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('club')
export class ClubController {
  constructor(private readonly clubService: ClubService) { }

  @Post()//revisar si necesita auth guard
  create(@Body() createClubDto: CreateClubDto) {
    return this.clubService.create(createClubDto);
  }

  @Post('dueno/:idDueno')
    @UseGuards(AuthGuard)
  createForOwner(
    @Param('idDueno') idDueno: string,
    @Body() body: any
  ) {
    return this.clubService.createForOwner(+idDueno, body);
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


  @Patch(':id')
    @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateClubDto: UpdateClubDto) {
    return this.clubService.update(+id, updateClubDto);
  }

  @Delete(':id')
    @UseGuards(AuthGuard)//posible admin rol
  remove(@Param('id') id: string) {
    return this.clubService.remove(+id);
  }
}

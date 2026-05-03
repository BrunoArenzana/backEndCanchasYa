import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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

  @Post('register')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  createWithClub(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    return this.duenoCanchaService.createDuenoWithClub(body, file);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.duenoCanchaService.login(body.email, body.password);
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
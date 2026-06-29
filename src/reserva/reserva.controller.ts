import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@Controller('reserva')
// @UseGuards(RolesGuard)
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  @UseGuards(AuthGuard) // solo los usuarios autenticados pueden crear reservas
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservaService.create(createReservaDto);
  }

  /*
    Mercado Pago / Demo local
    Crea una preferencia de pago para una reserva.

    - Si configurás MERCADOPAGO_ACCESS_TOKEN, intenta crear la preferencia real.
    - Si no hay token, devuelve URLs de simulación local para mostrar el flujo.
  */
  @Post(':id/mercadopago/preference')
  @UseGuards(AuthGuard)
  crearPreferenciaMercadoPago(@Param('id') id: string) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('ID inválido');
    return this.reservaService.crearPreferenciaMercadoPago(numericId);
  }

  /*
    Simulación local para dem MP
    Sirve para marcar el pago como aprobado, rechazado o pendiente sin depender
    de que Mercado Pago pueda volver a localhost.
  */
  @Post(':id/pago/simular')
  @UseGuards(AuthGuard)
  simularPago(
    @Param('id') id: string,
    @Body() body: { resultado?: 'aprobado' | 'rechazado' | 'pendiente' },
  ) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('ID inválido');

    return this.reservaService.simularPagoReserva(
      numericId,
      body?.resultado || 'aprobado',
    );
  }

  /*
    Variante GET de simulación local.
    Es útil para abrir una URL en el navegador durante la demo:
    http://localhost:3000/reserva/1/pago/simular?resultado=aprobado
  */
  @Get(':id/pago/simular')
  simularPagoDesdeNavegador(
    @Param('id') id: string,
    @Query('resultado') resultado: 'aprobado' | 'rechazado' | 'pendiente' = 'aprobado',
  ) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('ID inválido');

    return this.reservaService.simularPagoReserva(numericId, resultado);
  }

  /*
    Permite marcar una reserva como pagada en el club.
    Esto contempla el caso real de usuarios que prefieren pagar presencialmente.
  */
  @Patch(':id/pago-en-club')
  @UseGuards(AuthGuard)
  marcarPagoEnClub(@Param('id') id: string) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('ID inválido');
    return this.reservaService.marcarPagoEnClub(numericId);
  }

  @Get()
  findAll() {
    return this.reservaService.findAll();
  }

  @Get('usuario/:idUsuario')
  @UseGuards(AuthGuard) // solo los usuarios autenticados pueden ver sus reservas
  findByUsuario(@Param('idUsuario') idUsuario: string) {
    return this.reservaService.findByUsuario(+idUsuario);
  }

  @Get('club/:idClub')
  @UseGuards(AuthGuard) // solo los usuarios autenticados pueden ver reservas por club
  findByClub(@Param('idClub') idClub: string) {
    return this.reservaService.findByClub(+idClub);
  }

  @Get(':id')
  @UseGuards(AuthGuard) // solo los usuarios autenticados pueden ver una reserva específica
  findOne(@Param('id') id: string) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('ID inválido');
    return this.reservaService.findOne(numericId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard) // solo los usuarios autenticados pueden actualizar reservas
  update(@Param('id') id: string, @Body() updateReservaDto: UpdateReservaDto) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('ID inválido');
    return this.reservaService.update(numericId, updateReservaDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard) // solo los usuarios autenticados con rol admin pueden eliminar reservas
  @Roles('usuario', 'admin')
  remove(@Param('id') id: string) {
    const numericId = +id;
    if (isNaN(numericId)) throw new BadRequestException('ID inválido');
    return this.reservaService.remove(numericId);
  }
}

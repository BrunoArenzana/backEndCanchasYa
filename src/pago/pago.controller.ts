import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { PagoService } from './pago.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

@Controller('pago')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  @Post('mercadopago/preference/:idReserva')
  crearPreferenciaMercadoPago(
    @Param('idReserva') idReserva: string,
  ) {
    return this.pagoService.crearPreferenciaMercadoPago(+idReserva);
  }

  @Post('mercadopago/webhook')
  procesarWebhookMercadoPago(
    @Body() body: any,
    @Query('type') typeQuery?: string,
    @Query('data.id') dataIdQuery?: string,
    @Headers('x-signature') xSignature?: string,
    @Headers('x-request-id') xRequestId?: string,
  ) {
    return this.pagoService.procesarWebhookMercadoPago({
      dataId:
        dataIdQuery ||
        body?.data?.id ||
        body?.id,
      type:
        typeQuery ||
        body?.type ||
        body?.topic,
      xSignature,
      xRequestId,
    });
  }

  @Get('mercadopago/status/:idReserva')
  obtenerEstadoMercadoPago(
    @Param('idReserva') idReserva: string,
  ) {
    return this.pagoService.obtenerEstadoMercadoPago(+idReserva);
  }

  /*
    Mercado Pago vuelve primero a esta URL HTTPS pública.
    Desde acá redirigimos al frontend local.
  */
  @Get('mercadopago/retorno')
  retornoMercadoPago(
    @Query('payment') payment: string,
    @Query('reservaId') reservaId: string,
    @Res() response: Response,
  ) {
    const destino = this.pagoService.construirUrlRetornoFrontend(
      payment,
      reservaId,
    );

    return response.redirect(destino);
  }

  @Post()
  create(@Body() createPagoDto: CreatePagoDto) {
    return this.pagoService.create(createPagoDto);
  }

  @Get()
  findAll() {
    return this.pagoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePagoDto: UpdatePagoDto,
  ) {
    return this.pagoService.update(+id, updatePagoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagoService.remove(+id);
  }
}

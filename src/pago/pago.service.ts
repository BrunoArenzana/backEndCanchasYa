import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import { Repository } from 'typeorm';

import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Pago } from './entities/pago.entity';
import { Reserva } from '../reserva/entities/reserva.entity';

type WebhookInput = {
  dataId?: string;
  type?: string;
  xSignature?: string;
  xRequestId?: string;
};

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,

    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,

    private readonly configService: ConfigService,
  ) {}

  /*
    CRUD existente.
  */
  create(createPagoDto: CreatePagoDto) {
    return this.pagoRepository.save(createPagoDto);
  }

  findAll() {
    return this.pagoRepository.find({
      relations: ['reserva'],
    });
  }

  findOne(id: number) {
    return this.pagoRepository.findOne({
      where: { id_pago: id },
      relations: ['reserva'],
    });
  }

  update(id: number, updatePagoDto: UpdatePagoDto) {
    return this.pagoRepository.update({ id_pago: id }, updatePagoDto);
  }

  remove(id: number) {
    return this.pagoRepository.delete({ id_pago: id });
  }

  private obtenerAccessToken(): string {
    const token = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');

    if (!token) {
      throw new BadRequestException(
        'Falta configurar MERCADOPAGO_ACCESS_TOKEN en el backend.',
      );
    }

    return token;
  }

  private obtenerFrontendUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:5173'
    ).replace(/\/$/, '');
  }

  private obtenerBackendPublicUrl(): string {
    const url = this.configService.get<string>('BACKEND_PUBLIC_URL');

    if (!url) {
      throw new BadRequestException(
        'Falta configurar BACKEND_PUBLIC_URL con una URL HTTPS pública, por ejemplo la URL de ngrok.',
      );
    }

    return url.replace(/\/$/, '');
  }

  private async buscarReservaCompleta(idReserva: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.findOne({
      where: { id_reserva: idReserva },
      relations: [
        'usuario',
        'cancha',
        'cancha.id_club',
        'cancha.id_deporte',
      ],
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada.');
    }

    return reserva;
  }

  private normalizarMonto(valor: unknown): number {
    const monto = Number(valor);

    if (!Number.isFinite(monto)) return 0;

    return Math.round(monto * 100) / 100;
  }

  private mapearEstadoReservaPago(status: string): Reserva['estado_pago'] {
    if (status === 'approved') return 'pagado';

    if (
      status === 'rejected' ||
      status === 'cancelled' ||
      status === 'refunded' ||
      status === 'charged_back'
    ) {
      return 'rechazado';
    }

    return 'pendiente';
  }

  private mapearEstadoEntidadPago(status: string): Pago['estado'] {
    if (status === 'approved') return 'completado';

    if (
      status === 'rejected' ||
      status === 'cancelled' ||
      status === 'refunded' ||
      status === 'charged_back'
    ) {
      return 'rechazado';
    }

    return 'pendiente';
  }

  /*
    Crea una preferencia real de Mercado Pago Checkout Pro.
  */
  async crearPreferenciaMercadoPago(idReserva: number) {
    const reserva = await this.buscarReservaCompleta(idReserva);

    if (reserva.estado === 'cancelada') {
      throw new BadRequestException(
        'No se puede pagar una reserva cancelada.',
      );
    }

    if (
      reserva.estado_pago === 'pagado' ||
      reserva.estado_pago === 'pago_en_club'
    ) {
      throw new BadRequestException(
        'La reserva ya se encuentra pagada.',
      );
    }

    const monto = this.normalizarMonto(reserva.monto_total);

    if (monto <= 0) {
      throw new BadRequestException(
        'La reserva no tiene un monto válido para cobrar.',
      );
    }

    const accessToken = this.obtenerAccessToken();
    const backendPublicUrl = this.obtenerBackendPublicUrl();

    const preferencePayload = {
      items: [
        {
          id: String(reserva.id_reserva),
          title: `Reserva CanchasYa #${reserva.id_reserva}`,
          description: [
            reserva.cancha?.nombre_cancha || 'Cancha',
            reserva.cancha?.id_club?.nombre_club || 'Club',
            String(reserva.fecha),
            reserva.hora_inicio?.slice(0, 5),
          ]
            .filter(Boolean)
            .join(' - '),
          quantity: 1,
          currency_id: 'ARS',
          unit_price: monto,
        },
      ],
      payer: {
        name: reserva.usuario?.nombre_usuario || '',
        surname: reserva.usuario?.apellido_usuario || '',
        email: reserva.usuario?.email_usuario || '',
      },
      external_reference: String(reserva.id_reserva),
      statement_descriptor: 'CANCHASYA',
      /*
        Mercado Pago exige URLs públicas HTTPS para back_urls.
        Usamos el backend público como puente y luego el controller
        redirige al frontend local.
      */
      back_urls: {
        success: `${backendPublicUrl}/pago/mercadopago/retorno?payment=success&reservaId=${reserva.id_reserva}`,
        failure: `${backendPublicUrl}/pago/mercadopago/retorno?payment=failure&reservaId=${reserva.id_reserva}`,
        pending: `${backendPublicUrl}/pago/mercadopago/retorno?payment=pending&reservaId=${reserva.id_reserva}`,
      },
      auto_return: 'approved',
      notification_url: `${backendPublicUrl}/pago/mercadopago/webhook`,
      metadata: {
        reserva_id: reserva.id_reserva,
        usuario_id: reserva.usuario?.id_usuario,
        cancha_id: reserva.cancha?.id_cancha,
      },
    };

    const response = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `reserva-${reserva.id_reserva}-${Date.now()}`,
        },
        body: JSON.stringify(preferencePayload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Error al crear preferencia de Mercado Pago:', data);

      throw new BadRequestException(
        data?.message ||
          'Mercado Pago no pudo crear la preferencia de pago.',
      );
    }

    reserva.mercado_pago_preference_id = data.id || null;
    reserva.mercado_pago_status = 'preference_created';
    reserva.estado_pago = 'pendiente';

    await this.reservaRepository.save(reserva);

    const usarSandbox =
      this.configService.get<string>('MERCADOPAGO_USE_SANDBOX') === 'true';

    const checkoutUrl = usarSandbox
      ? data.sandbox_init_point || data.init_point
      : data.init_point || data.sandbox_init_point;

    return {
      reservaId: reserva.id_reserva,
      preferenceId: data.id,
      amount: monto,
      checkout_url: checkoutUrl,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    };
  }

  /*
    Valida x-signature si MERCADOPAGO_WEBHOOK_SECRET está configurado.
    En producción la variable debe ser obligatoria.
  */
  private validarFirmaWebhook({
    dataId,
    xSignature,
    xRequestId,
  }: {
    dataId: string;
    xSignature?: string;
    xRequestId?: string;
  }) {
    const secret = this.configService.get<string>(
      'MERCADOPAGO_WEBHOOK_SECRET',
    );

    if (!secret) {
      console.warn(
        'MERCADOPAGO_WEBHOOK_SECRET no está configurado. El webhook se procesa sin validación de firma.',
      );
      return;
    }

    if (!xSignature || !xRequestId) {
      throw new UnauthorizedException(
        'La notificación no contiene la firma requerida.',
      );
    }

    const partes = Object.fromEntries(
      xSignature.split(',').map((parte) => {
        const [clave, valor] = parte.trim().split('=');
        return [clave, valor];
      }),
    );

    const ts = partes.ts;
    const firmaRecibida = partes.v1;

    if (!ts || !firmaRecibida) {
      throw new UnauthorizedException(
        'Firma de webhook inválida.',
      );
    }

    const idNormalizado = String(dataId).toLowerCase();
    const manifest = `id:${idNormalizado};request-id:${xRequestId};ts:${ts};`;

    const firmaEsperada = createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    const recibidaBuffer = Buffer.from(firmaRecibida, 'hex');
    const esperadaBuffer = Buffer.from(firmaEsperada, 'hex');

    if (
      recibidaBuffer.length !== esperadaBuffer.length ||
      !timingSafeEqual(recibidaBuffer, esperadaBuffer)
    ) {
      throw new UnauthorizedException(
        'La firma del webhook no es válida.',
      );
    }
  }

  private async consultarPagoMercadoPago(paymentId: string) {
    const accessToken = this.obtenerAccessToken();

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Error al consultar pago de Mercado Pago:', data);

      throw new BadRequestException(
        data?.message ||
          'No se pudo consultar el pago en Mercado Pago.',
      );
    }

    return data;
  }

  private async persistirResultadoPago(payment: any) {
    const idReserva = Number(
      payment?.external_reference ||
        payment?.metadata?.reserva_id,
    );

    if (!Number.isInteger(idReserva) || idReserva <= 0) {
      throw new BadRequestException(
        'El pago no contiene una referencia de reserva válida.',
      );
    }

    const reserva = await this.buscarReservaCompleta(idReserva);
    const montoEsperado = this.normalizarMonto(reserva.monto_total);
    const montoRecibido = this.normalizarMonto(
      payment?.transaction_amount,
    );

    /*
      Nunca se marca como pagada una reserva si el monto aprobado no coincide.
    */
    if (
      payment?.status === 'approved' &&
      Math.abs(montoEsperado - montoRecibido) > 0.01
    ) {
      console.error('Monto de Mercado Pago no coincide con la reserva:', {
        idReserva,
        montoEsperado,
        montoRecibido,
        paymentId: payment?.id,
      });

      throw new BadRequestException(
        'El monto aprobado no coincide con el monto de la reserva.',
      );
    }

    const status = String(payment?.status || 'pending');
    const estadoPagoReserva = this.mapearEstadoReservaPago(status);

    reserva.estado_pago = estadoPagoReserva;
    reserva.mercado_pago_payment_id = String(payment.id);
    reserva.mercado_pago_status = status;
    reserva.monto_pagado =
      status === 'approved' ? montoRecibido : null;
    reserva.fecha_pago =
      status === 'approved'
        ? new Date(payment?.date_approved || Date.now())
        : null;

    await this.reservaRepository.save(reserva);

    const referencia = String(payment.id);
    let pago = await this.pagoRepository.findOne({
      where: { referencia_externa: referencia },
      relations: ['reserva'],
    });

    if (!pago) {
      pago = this.pagoRepository.create({
        monto: montoRecibido || montoEsperado,
        metodo: 'mercado_pago',
        estado: this.mapearEstadoEntidadPago(status),
        referencia_externa: referencia,
        fecha_pago:
          status === 'approved'
            ? new Date(payment?.date_approved || Date.now())
            : null,
        reserva,
      });
    } else {
      pago.monto = montoRecibido || montoEsperado;
      pago.metodo = 'mercado_pago';
      pago.estado = this.mapearEstadoEntidadPago(status);
      pago.fecha_pago =
        status === 'approved'
          ? new Date(payment?.date_approved || Date.now())
          : null;
      pago.reserva = reserva;
    }

    await this.pagoRepository.save(pago);

    return {
      id_reserva: reserva.id_reserva,
      estado_pago: reserva.estado_pago,
      mercado_pago_status: reserva.mercado_pago_status,
      mercado_pago_payment_id: reserva.mercado_pago_payment_id,
      monto_pagado: reserva.monto_pagado,
      fecha_pago: reserva.fecha_pago,
    };
  }

  construirUrlRetornoFrontend(
    payment: string,
    reservaId?: string | number,
  ): string {
    const frontendUrl = this.obtenerFrontendUrl();
    const estadoPermitido = ['success', 'failure', 'pending'].includes(payment)
      ? payment
      : 'pending';

    const params = new URLSearchParams({
      payment: estadoPermitido,
    });

    if (reservaId !== undefined && reservaId !== null && String(reservaId)) {
      params.set('reservaId', String(reservaId));
    }

    return `${frontendUrl}/dashboardUsuario?${params.toString()}`;
  }

  async procesarWebhookMercadoPago(input: WebhookInput) {
    const { dataId, type, xSignature, xRequestId } = input;

    /*
      Checkout Pro envía notificaciones del tópico payment.
      Otros tópicos se aceptan con 200 pero no modifican reservas.
    */
    if (type && type !== 'payment') {
      return {
        received: true,
        ignored: true,
        type,
      };
    }

    if (!dataId) {
      return {
        received: true,
        ignored: true,
        reason: 'La notificación no contiene data.id.',
      };
    }

    this.validarFirmaWebhook({
      dataId,
      xSignature,
      xRequestId,
    });

    const payment = await this.consultarPagoMercadoPago(dataId);
    const resultado = await this.persistirResultadoPago(payment);

    return {
      received: true,
      ...resultado,
    };
  }

  async obtenerEstadoMercadoPago(idReserva: number) {
    let reserva = await this.buscarReservaCompleta(idReserva);

    /*
      Si ya tenemos un payment_id, consultamos nuevamente a Mercado Pago.
      Esto permite recuperar el estado aunque el webhook se demore.
    */
    if (
      reserva.mercado_pago_payment_id &&
      reserva.estado_pago !== 'pagado'
    ) {
      try {
        const payment = await this.consultarPagoMercadoPago(
          reserva.mercado_pago_payment_id,
        );

        await this.persistirResultadoPago(payment);
        reserva = await this.buscarReservaCompleta(idReserva);
      } catch (error) {
        console.warn(
          'No se pudo resincronizar el pago. Se devuelve el estado persistido.',
          error,
        );
      }
    }

    return {
      id_reserva: reserva.id_reserva,
      estado_pago: reserva.estado_pago,
      mercado_pago_status: reserva.mercado_pago_status,
      mercado_pago_payment_id: reserva.mercado_pago_payment_id,
      monto_pagado: reserva.monto_pagado,
      fecha_pago: reserva.fecha_pago,
    };
  }
}

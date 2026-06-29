import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';

type ResultadoPagoDemo = 'aprobado' | 'rechazado' | 'pendiente';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
  ) {}

  private normalizarReserva(reserva: Reserva | null) {
    if (!reserva) return null;

    return {
      ...reserva,
      cancha: reserva.cancha
        ? {
            ...reserva.cancha,
            club: reserva.cancha.id_club,
            deporte: reserva.cancha.id_deporte,
          }
        : reserva.cancha,
    };
  }

  private obtenerFrontendUrl() {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
  }

  private obtenerBackendUrl() {
    return process.env.BACKEND_URL || 'http://localhost:3000';
  }

  private normalizarImporte(value: any): number {
    if (value === null || value === undefined || value === '') return 0;

    const numero = Number(value);

    if (Number.isNaN(numero)) return 0;

    return Math.round(numero * 100) / 100;
  }

  private obtenerMontoReserva(reserva: Reserva): number {
    const montoReserva = this.normalizarImporte(reserva.monto_total);

    if (montoReserva > 0) {
      return montoReserva;
    }

    const precioCancha = this.normalizarImporte(reserva.cancha?.precio_por_hora);

    return precioCancha;
  }

  private obtenerDescripcionReserva(reserva: Reserva): string {
    const nombreCancha = reserva.cancha?.nombre_cancha || 'Cancha';
    const nombreClub = reserva.cancha?.id_club?.nombre_club || 'Club';
    const fecha = reserva.fecha ? String(reserva.fecha) : '';
    const hora = reserva.hora_inicio || '';

    return `${nombreCancha} - ${nombreClub} - ${fecha} ${hora}`.trim();
  }

  async create(createReservaDto: CreateReservaDto) {
    const { id_usuario, id_cancha, ...rest } = createReservaDto;

    const reserva = this.reservaRepository.create({
      ...rest,
      estado_pago: 'pendiente',
      usuario: id_usuario ? { id_usuario } : undefined,
      cancha: id_cancha ? { id_cancha } : undefined,
    });

    const reservaGuardada = await this.reservaRepository.save(reserva);
    return this.findOne(reservaGuardada.id_reserva);
  }

  async findAll() {
    const reservas = await this.reservaRepository.find({
      relations: ['usuario', 'cancha', 'cancha.id_club', 'cancha.id_deporte'],
    });

    return reservas.map((reserva) => this.normalizarReserva(reserva));
  }

  async findByUsuario(idUsuario: number) {
    const reservas = await this.reservaRepository.find({
      where: { usuario: { id_usuario: idUsuario } },
      relations: ['usuario', 'cancha', 'cancha.id_club', 'cancha.id_deporte'],
    });

    return reservas.map((reserva) => this.normalizarReserva(reserva));
  }

  async findByClub(idClub: number) {
    const reservas = await this.reservaRepository.find({
      where: { cancha: { id_club: { id_club: idClub } } },
      relations: ['usuario', 'cancha', 'cancha.id_club', 'cancha.id_deporte'],
    });

    if (reservas.length === 0) {
      // Fallback query with QueryBuilder if the nested where clause failed
      const queryReservas = await this.reservaRepository
        .createQueryBuilder('reserva')
        .leftJoinAndSelect('reserva.usuario', 'usuario')
        .leftJoinAndSelect('reserva.cancha', 'cancha')
        .leftJoinAndSelect('cancha.id_club', 'club')
        .leftJoinAndSelect('cancha.id_deporte', 'deporte')
        .where('cancha.id_club = :idClub', { idClub })
        .getMany();

      return queryReservas.map((reserva) => this.normalizarReserva(reserva));
    }

    return reservas.map((reserva) => this.normalizarReserva(reserva));
  }

  async findOne(id: number) {
    const reserva = await this.reservaRepository.findOne({
      where: { id_reserva: id },
      relations: ['usuario', 'cancha', 'cancha.id_club', 'cancha.id_deporte'],
    });

    return this.normalizarReserva(reserva);
  }

  async findEntityById(id: number) {
    const reserva = await this.reservaRepository.findOne({
      where: { id_reserva: id },
      relations: ['usuario', 'cancha', 'cancha.id_club', 'cancha.id_deporte'],
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada.');
    }

    return reserva;
  }

  async update(id: number, updateReservaDto: UpdateReservaDto) {
    const { id_usuario, id_cancha, ...rest } = updateReservaDto;

    const reserva = await this.reservaRepository.findOne({
      where: { id_reserva: id },
    });

    if (!reserva) return null;

    Object.assign(reserva, rest);

    if (id_usuario !== undefined) {
      reserva.usuario = { id_usuario } as any;
    }

    if (id_cancha !== undefined) {
      reserva.cancha = { id_cancha } as any;
    }

    const reservaGuardada = await this.reservaRepository.save(reserva);
    return this.findOne(reservaGuardada.id_reserva);
  }

  remove(id: number) {
    return this.reservaRepository.delete({ id_reserva: id });
  }

  async crearPreferenciaMercadoPago(idReserva: number) {
    const reserva = await this.findEntityById(idReserva);

    if (reserva.estado === 'cancelada') {
      throw new BadRequestException('No se puede pagar una reserva cancelada.');
    }

    if (
      reserva.estado_pago === 'pagado' ||
      reserva.estado_pago === 'pago_en_club'
    ) {
      throw new BadRequestException('La reserva ya se encuentra pagada.');
    }

    const monto = this.obtenerMontoReserva(reserva);

    if (!monto || monto <= 0) {
      throw new BadRequestException(
        'La reserva no tiene un monto válido para pagar.',
      );
    }

    const frontendUrl = this.obtenerFrontendUrl();
    const backendUrl = this.obtenerBackendUrl();
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    const demoApprovedUrl = `${backendUrl}/reserva/${idReserva}/pago/simular?resultado=aprobado`;
    const demoRejectedUrl = `${backendUrl}/reserva/${idReserva}/pago/simular?resultado=rechazado`;
    const demoPendingUrl = `${backendUrl}/reserva/${idReserva}/pago/simular?resultado=pendiente`;

    /*
      Si no hay token, no rompemos la demo local.
      Devolvemos URLs para simular aprobado/rechazado/pendiente.
    */
    if (!accessToken) {
      return {
        message:
          'No hay MERCADOPAGO_ACCESS_TOKEN configurado. Se devuelven URLs de simulación local.',
        demo: true,
        reservaId: idReserva,
        amount: monto,
        init_point: demoApprovedUrl,
        demoApprovedUrl,
        demoRejectedUrl,
        demoPendingUrl,
      };
    }

    const preferencePayload = {
      items: [
        {
          id: String(reserva.id_reserva),
          title: `Reserva CanchasYa #${reserva.id_reserva}`,
          description: this.obtenerDescripcionReserva(reserva),
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
      back_urls: {
        success: `${frontendUrl}/mis-reservas?payment=success&reservaId=${idReserva}`,
        failure: `${frontendUrl}/mis-reservas?payment=failure&reservaId=${idReserva}`,
        pending: `${frontendUrl}/mis-reservas?payment=pending&reservaId=${idReserva}`,
      },
      notification_url: `${backendUrl}/reserva/${idReserva}/pago/simular?resultado=aprobado`,
      metadata: {
        reserva_id: reserva.id_reserva,
        usuario_id: reserva.usuario?.id_usuario,
        cancha_id: reserva.cancha?.id_cancha,
      },
    };
//MERCADO PAGO
    const response = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencePayload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Error Mercado Pago:', data);

      throw new BadRequestException(
        data?.message || 'No se pudo crear la preferencia de Mercado Pago.',
      );
    }

    reserva.mercado_pago_preference_id = data.id || null;
    reserva.mercado_pago_status = 'preference_created';
    reserva.estado_pago = 'pendiente';

    await this.reservaRepository.save(reserva);

    return {
      message: 'Preferencia creada correctamente.',
      demo: false,
      reservaId: idReserva,
      amount: monto,
      preferenceId: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      demoApprovedUrl,
      demoRejectedUrl,
      demoPendingUrl,
    };
  }

  async simularPagoReserva(idReserva: number, resultado: ResultadoPagoDemo) {
    const reserva = await this.findEntityById(idReserva);
    const monto = this.obtenerMontoReserva(reserva);

    if (resultado === 'aprobado') {
      reserva.estado_pago = 'pagado';
      reserva.mercado_pago_status = 'approved_demo';
      reserva.mercado_pago_payment_id = `DEMO-${Date.now()}`;
      reserva.monto_pagado = monto;
      reserva.fecha_pago = new Date();
    } else if (resultado === 'rechazado') {
      reserva.estado_pago = 'rechazado';
      reserva.mercado_pago_status = 'rejected_demo';
      reserva.mercado_pago_payment_id = `DEMO-${Date.now()}`;
      reserva.monto_pagado = null;
      reserva.fecha_pago = null;
    } else {
      reserva.estado_pago = 'pendiente';
      reserva.mercado_pago_status = 'pending_demo';
      reserva.mercado_pago_payment_id = `DEMO-${Date.now()}`;
      reserva.monto_pagado = null;
      reserva.fecha_pago = null;
    }

    const reservaGuardada = await this.reservaRepository.save(reserva);

    return {
      message:
        resultado === 'aprobado'
          ? 'Pago aprobado correctamente.'
          : resultado === 'rechazado'
          ? 'Pago rechazado.'
          : 'Pago pendiente.',
      resultado,
      reserva: this.normalizarReserva(reservaGuardada),
    };
  }

  async marcarPagoEnClub(idReserva: number) {
    const reserva = await this.findEntityById(idReserva);

    if (reserva.estado === 'cancelada') {
      throw new BadRequestException(
        'No se puede marcar como pagada una reserva cancelada.',
      );
    }

    const monto = this.obtenerMontoReserva(reserva);

    reserva.estado_pago = 'pago_en_club';
    reserva.mercado_pago_status = 'paid_on_site';
    reserva.mercado_pago_payment_id = null;
    reserva.monto_pagado = monto;
    reserva.fecha_pago = new Date();

    const reservaGuardada = await this.reservaRepository.save(reserva);

    return {
      message: 'Reserva marcada como pagada en el club.',
      reserva: this.normalizarReserva(reservaGuardada),
    };
  }
}

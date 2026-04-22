export class CreatePagoDto {
  id_reserva: number;
  monto: number;
  metodo: string;
  estado?: string;
  referencia_externa?: string;
  fecha_pago?: Date;
}

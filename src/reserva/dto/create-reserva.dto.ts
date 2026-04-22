export class CreateReservaDto {
  id_usuario: number;
  id_cancha: number;
  fecha: Date;
  hora_inicio: string;
  hora_fin: string;
  monto_total: number;
  estado?: string;
}

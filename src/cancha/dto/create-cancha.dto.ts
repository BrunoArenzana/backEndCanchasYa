export class CreateCanchaDto {
  id_club!: number;
  id_deporte!: number;
  nombre_cancha!: string;
  descripcion_cancha?: string;
  precio_por_hora!: number;
  activa?: number;
}

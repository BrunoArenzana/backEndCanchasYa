export class CreateClubDto {
  id_dueno: number;
  nombre_club: string;
  direccion_club: string;
  ciudad_club: string;
  telefono_club?: string;
  descripcion_club?: string;
  estado?: string;
  id_admin_aprobado?: number;
}

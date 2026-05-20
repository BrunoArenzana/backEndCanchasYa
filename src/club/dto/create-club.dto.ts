export class CreateClubDto {
  nombre_club!: string;
  direccion_club!: string;
  ciudad_club!: string;
  provincia_club?: string;
  cp_club?: string;
  telefono_club?: string;
  descripcion_club?: string;
  id_dueno!: number;
  logo_club!: string;
 // estado?: string;
  //id_admin_aprobado?: number;
}

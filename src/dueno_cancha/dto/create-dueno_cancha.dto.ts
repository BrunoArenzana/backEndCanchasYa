export class CreateDuenoCanchaDto {
  nombre_dueno!: string;
  apellido_dueno!: string;
  razonSocial_dueno!: string;
  CUIT_dueno!: string;
  telefono_dueno?: string;
  email_dueno!: string;
  password_dueno!: string;
  direccion_dueno?: string;
  ciudad_dueno?: string;
  provincia_dueno?: string;
  cp_dueno?: string;
  estado_dueno?: string;
  id_admin_aprobado?: number;
  imgClub?: string;
  canchas_dueno?: any[];
}


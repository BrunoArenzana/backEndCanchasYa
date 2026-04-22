export class CreateDuenoCanchaDto {
  nombre_dueno: string;
  apellido_dueno: string;
  email_dueno: string;
  password_dueno: string;
  telefono_dueno?: string;
  estado_dueno?: string;
  id_admin_aprobado?: number;
}

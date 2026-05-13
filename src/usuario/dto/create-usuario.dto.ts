export class CreateUsuarioDto {
  nombre_usuario!: string;
  apellido_usuario!: string;
  email_usuario!: string;
  password_usuario!: string;
  telefono_usuario!: string;
  DNI_usuario!: string;
  ciudad_usuario!: string;
  provincia_usuario!: string;
  cp_usuario!: string;
  canchas_usuario?: [];//esto va así
}

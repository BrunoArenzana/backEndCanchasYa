export class    CreateUserDto {
    nombre_usuario!: string;
    apellido_usuario!: string;
    email_usuario!: string;
    dni_usuario?: string;
    CUIT_usuario?: string;
    password_usuario!: string;
    telefono_usuario?: string;
    direccion_usuario?: string;
    ciudad_usuario?: string;
    provincia_usuario?: string;
    cp_usuario?: string;
    estado_usuario?: string;
    tipo_usuario?: string;
    canchas_dueno?: any[];
}

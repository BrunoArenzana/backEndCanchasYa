# Módulo Usuario

Este módulo gestiona a los usuarios finales (clientes) que utilizan la plataforma para reservar canchas.

## Archivos y Funciones

- **usuario.controller.ts**: Define las rutas para el registro de usuarios, inicio de sesión y gestión del perfil del cliente.
- **usuario.module.ts**: Configura la seguridad y el acceso a los datos de los usuarios.
- **usuario.service.ts**: Contiene la lógica para el manejo de cuentas de usuario, incluyendo validaciones de email y gestión de contraseñas.

### Carpeta `dto`
- **create-usuario.dto.ts**: Define los campos obligatorios para el registro de un nuevo usuario.
- **update-usuario.dto.ts**: Define los campos que un usuario puede actualizar en su perfil.

### Carpeta `entities`
- **usuario.entity.ts**: Estructura de la tabla `usuario` que almacena la información de los clientes.



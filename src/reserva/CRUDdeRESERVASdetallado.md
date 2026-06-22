# Guía Detallada del CRUD de Reservas en CanchasYa!

Este documento detalla, punto por punto y paso a paso, el funcionamiento interno del flujo **CRUD** (Altas, Bajas, Modificaciones y Lectura/Listado) de las reservas en la plataforma **CanchasYa!**, especificando los orígenes de datos, procesamiento en frontend y backend, validaciones y la persistencia en la base de datos.

---

## Arquitectura General
El flujo de reservas interactúa entre tres capas principales:
1. **Frontend (React)**: Componente [`DashboardUsuario.jsx`](file:///c:/Users/Mi%20PC/OneDrive/Desktop/CANCHAS%20YA%202026/canchaYa/src/components/dashboardUsuario/DashboardUsuario.jsx) que actúa como cliente y maneja el flujo guiado.
2. **Backend (NestJS + TypeORM)**: Carpeta [`reserva`](file:///c:/Users/Mi%20PC/OneDrive/Desktop/CANCHAS%20YA%202026/backEndCanchasYa/src/reserva) que recibe las solicitudes HTTP, aplica guardias de autenticación y ejecuta la lógica de negocio.
3. **Base de Datos (SQL)**: Tabla `reserva` administrada mediante la entidad [`Reserva`](file:///c:/Users/Mi%20PC/OneDrive/Desktop/CANCHAS%20YA%202026/backEndCanchasYa/src/reserva/entities/reserva.entity.ts).

---

## 1. Altas (Creación de Reservas)

### A. Flujo en el Frontend (Wizard de Reservas)
1. **Origen de la Información**:
   - **Datos de Sesión**: El ID del usuario autenticado se extrae de `usuario.id_usuario` (guardado previamente en `localStorage` al iniciar sesión).
   - **Wizard Guiado**:
     - *Paso 1 (Deporte)*: El usuario elige un deporte del carrusel.
     - *Paso 2 (Club y Cancha)*: El usuario selecciona la cancha específica de un club. Se obtiene el ID de la cancha (`canchaSeleccionada.id`) y el precio del turno (`canchaSeleccionada.precio`).
     - *Paso 3 (Fecha)*: Se selecciona una fecha del calendario (formato visual `dd/mm/yyyy`).
     - *Paso 4 (Hora)*: El usuario elige una hora de inicio disponible (cargada dinámicamente de `/disponibilidad/cancha/:idCancha`).
2. **Procesamiento de los Datos**:
   - **Validaciones temporales**: Se comprueba que la fecha no sea pasada (`esFechaPasada`) y que el horario no haya vencido si la fecha es hoy (`esHorarioPasado`).
   - **Validación local de solapamientos**: La función `esHorarioOcupado` verifica que el usuario no tenga otra reserva en el mismo slot en su estado local de React.
   - **Normalización de formatos**:
     - La fecha visual `dd/mm/yyyy` se convierte a formato SQL `YYYY-MM-DD`.
     - La hora de inicio se formatea como `HH:MM:00` (ej: `19:00:00`).
     - La hora de fin se calcula sumando 1 hora al inicio (ej: `20:00:00`).
3. **Envío y Persistencia**:
   - Se arma el payload JSON con la estructura del DTO:
     ```json
     {
       "id_usuario": 5,
       "id_cancha": 12,
       "fecha": "2026-06-25",
       "hora_inicio": "19:00:00",
       "hora_fin": "20:00:00",
       "monto_total": 8500.00,
       "estado": "confirmada"
     }
     ```
   - Se realiza una petición HTTP `POST` a `API_URL/reserva` enviando el token JWT en la cabecera `Authorization: Bearer <token>`.
   - Si la respuesta es exitosa, se ejecuta una llamada secundaria `POST` a `API_URL/contact` para enviar un email de confirmación automático al correo del usuario.
   - Se actualiza el estado global de React llamando a `onAddReserva`.

### B. Flujo en el Backend (NestJS + TypeORM)
1. **Recepción del Request**:
   - El endpoint `@Post()` de [`reserva.controller.ts`](file:///c:/Users/Mi%20PC/OneDrive/Desktop/CANCHAS%20YA%202026/backEndCanchasYa/src/reserva/reserva.controller.ts) intercepta la petición. Cuenta con `@UseGuards(AuthGuard)` para validar el token de acceso.
2. **Procesamiento y Mapeo**:
   - Recibe los datos validados implícitamente por la clase [`CreateReservaDto`](file:///c:/Users/Mi%20PC/OneDrive/Desktop/CANCHAS%20YA%202026/backEndCanchasYa/src/reserva/dto/create-reserva.dto.ts).
   - En [`reserva.service.ts`](file:///c:/Users/Mi%20PC/OneDrive/Desktop/CANCHAS%20YA%202026/backEndCanchasYa/src/reserva/reserva.service.ts), se extraen `id_usuario` e `id_cancha` del DTO.
   - Se utiliza `this.reservaRepository.create(...)` mapeando el objeto DTO y asociando las relaciones relacionales de TypeORM (`usuario` y `cancha`).
3. **Persistencia en Base de Datos**:
   - `this.reservaRepository.save(reserva)` ejecuta la consulta `INSERT INTO reserva` en la base de datos SQL.
   - La tabla `reserva` almacena el nuevo registro con un ID autoincremental (`id_reserva`), las claves foráneas correspondientes, la fecha/hora del turno, el costo y el estado (por defecto `confirmada` o `pendiente`).
   - Se retorna la reserva cargada con sus relaciones completas (`usuario`, `cancha`, `club` y `deporte`) para que el frontend pueda renderizarla con los nombres correspondientes.

---

## 2. Bajas (Cancelación / Eliminación)

### A. Flujo en el Frontend
1. **Origen de la Información**:
   - El usuario hace clic en el botón **"Cancelar reserva"** (o "Borrar reserva" para turnos ya transcurridos) en el menú desplegable de opciones de su tarjeta de reserva.
2. **Procesamiento de los Datos**:
   - **Regla de Negocio de 24 Horas**: Se ejecuta la validación `puedeGestionarPorAnticipacion`. Si la reserva es futura y faltan menos de 24 horas para el turno, se prohíbe la cancelación y se muestra un SweetAlert de error.
   - **Confirmación Visual**: Si se cumple la regla de anticipación, se abre una ventana modal de **SweetAlert2** solicitando confirmación del usuario.
3. **Envío y Actualización**:
   - Si el usuario confirma la acción, se envía una solicitud HTTP `DELETE` a `API_URL/reserva/:id` con la cabecera de autenticación.
   - Tras el éxito de la petición:
     - Se envía una petición `POST` al endpoint `/contact` para notificar al usuario por correo que el turno fue cancelado.
     - Se remueve visualmente del panel agregando el ID de la reserva al estado local `reservasEliminadas` y disparando `onDeleteReserva`.

### B. Flujo en el Backend
1. **Recepción del Request**:
   - El endpoint `@Delete(':id')` en `ReservaController` intercepta la petición. Requiere los guardias `AuthGuard` y `RolesGuard` con el decorador `@Roles('usuario', 'admin')`.
2. **Procesamiento y Eliminación**:
   - Convierte el parámetro `id` a numérico. Si no es válido, lanza una excepción `BadRequestException`.
   - Llama a `this.reservaService.remove(id)`.
   - Ejecuta `this.reservaRepository.delete({ id_reserva: id })`.
3. **Persistencia**:
   - Ejecuta la sentencia `DELETE FROM reserva WHERE id_reserva = :id` física en la base de datos, destruyendo el registro.

---

## 3. Modificación (Edición de Reservas)

### A. Flujo en el Frontend (Proceso Seguro de Re-reservación)
1. **Origen de la Información**:
   - El usuario hace clic en **"Modificar"** en una tarjeta de reserva válida (futura y con >24 horas de antelación).
2. **Procesamiento de los Datos**:
   - La reserva original se almacena temporalmente en el estado `reservaEnEdicion`.
   - El frontend mantiene fijos el deporte, club y cancha original en el wizard, pero **limpia la fecha y hora seleccionadas**.
   - El usuario elige un nuevo día y un nuevo slot de horario disponible.
3. **Ejecución coordinada (POST + DELETE)**:
   - Al confirmar el cambio, el sistema ejecuta dos pasos asíncronos consecutivos para evitar solapamientos e inconsistencias de slots:
     1. **Creación**: Se envía una solicitud `POST` a `/reserva` con los datos del nuevo turno.
     2. **Eliminación**: Si el paso anterior es exitoso, se envía inmediatamente una solicitud `DELETE` a `/reserva/:idOriginal` para dar de baja el turno anterior.
   - Se envía una notificación por correo electrónico con el asunto `"Reserva modificada"` y los detalles del nuevo horario.
   - Se actualiza el estado global de React con el nuevo identificador de reserva y el slot actualizado.

### B. Flujo en el Backend (Soporte Directo de Actualización)
- Aunque el frontend utiliza el flujo coordinado de `POST` + `DELETE` para garantizar la consistencia en tiempo real de los slots, el backend cuenta con un endpoint `@Patch(':id')` en [`reserva.controller.ts`](file:///c:/Users/Mi%20PC/OneDrive/Desktop/CANCHAS%20YA%202026/backEndCanchasYa/src/reserva/reserva.controller.ts) que recibe un [`UpdateReservaDto`](file:///c:/Users/Mi%20PC/OneDrive/Desktop/CANCHAS%20YA%202026/backEndCanchasYa/src/reserva/dto/update-reserva.dto.ts):
  1. Busca la reserva original en la base de datos: `this.reservaRepository.findOne({ where: { id_reserva: id } })`.
  2. Utiliza `Object.assign(reserva, rest)` para sobreescribir las propiedades modificadas (ej. `fecha`, `hora_inicio`, `monto_total`, `estado`).
  3. Reasocia el usuario o la cancha mediante sus claves primarias si se incluyeron en el DTO de actualización.
  4. Llama a `this.reservaRepository.save(reserva)` que ejecuta un `UPDATE` en la tabla `reserva` persistiendo los cambios modificados.

---

## 4. Lectura y Listado (Consulta de Reservas)

### A. Flujo en el Frontend
1. **Origen de la Información**:
   - Al renderizarse la aplicación (`App.jsx`), se ejecuta el efecto `useEffect` que detecta la sesión activa.
   - Llama a `fetchReservas(idUsuario)` para usuarios regulares o `fetchReservasPorClub(idClub)` si el rol es de un club.
2. **Procesamiento de los Datos**:
   - Se hace una petición `GET` a `API_URL/reserva/usuario/:idUsuario` con el token JWT.
   - El arreglo de datos recibido se transforma mediante la función helper `mapReservaDesdeApi` para unificar propiedades (ej. mapear `id_reserva` a `id`, simplificar relaciones de objetos anidados a strings planos como `club`, `deporte` y `cancha`).
   - Se evalúa dinámicamente el campo `puedeGestionar` comparando la diferencia de tiempo entre el momento actual (`new Date()`) y la fecha/hora del turno para ver si supera las 24 horas mínimas de anticipación requeridas.
3. **Renderizado**:
   - El listado se ordena cronológicamente (las más próximas primero) y se propaga al estado local de React, mostrándose en el panel lateral del Dashboard del Usuario.

### B. Flujo en el Backend
1. **Origen y Consulta**:
   - **Por Usuario**: El método `findByUsuario` busca todos los registros filtrando por `id_usuario`.
   - **Por Club**: El método `findByClub` busca las reservas filtrando las canchas pertenecientes al `id_club`. Utiliza un fallback de `QueryBuilder` si la consulta por relación anidada de TypeORM falla.
2. **Procesamiento**:
   - Ambas consultas se cargan aplicando `relations: ['usuario', 'cancha', 'cancha.id_club', 'cancha.id_deporte']` para unir las tablas implicadas mediante `LEFT JOIN`.
   - Cada entidad de reserva recuperada se procesa en el método `normalizarReserva` del servicio, el cual desanida y reestructura los identificadores de club y deporte de la cancha antes de enviar la respuesta JSON final al cliente.

canchaYa   ---   Trabajo Final FullStack  --   

Google Drive https://drive.google.com/drive/folders/1ERLAKYx2MZ3ad8WySdDEEBkI0lSLMc78
Trello https://trello.com/b/abW2Uxqt/tp-final
Prezzi https://prezi.com/p/edit/l3mnsysrfyi0/ (Presentacion producto)
Redes Sociales producto : Gmail.com:  icanchas@gmail.com
                          Instagram: www.instagram.com/canchasyaa
                          Facebook: www.

CanchaYa - Plataforma de Reserva de Canchas Deportivas (Backend)
Es la API y el núcleo lógico de la aplicación, encargada de gestionar los datos, la lógica de negocio y las comunicaciones en tiempo real de la plataforma.

---

 📜 Índice

1.  Idea y Propósito del Proyecto
2.  🌟 Características Principales
3.  ⚙️ Funcionalidad Detallada
4.  🛠️ Stack de Tecnología
5.  🚀 Cómo Empezar (Guía de Desarrollo)

---

## 🎯 Idea y Propósito del Proyecto
 IDEA y SOLUCION PROPUESTA:
 
El problema: Procesar y gestionar de manera eficiente, segura y en tiempo real las reservas de canchas, pagos, notificaciones y la administración de los clubes.

La solución: El Backend de "CanchaYa" provee una API robusta y escalable que sirve de soporte al Frontend. Maneja toda la lógica de validación, persistencia de datos (usuarios, clubes, canchas, reservas) y automatización de tareas (como desactivar clubes por falta de pago mediante Cron Jobs).

---

## 🌟 Características Principales

*   API Robusta: Endpoints estructurados para la gestión integral de entidades.
*   Comunicación en Tiempo Real: Uso de WebSockets para notificaciones y actualizaciones en vivo.
*   Automatización de Tareas: Cron Jobs para verificar vencimientos de pagos y actualizar estados de clubes y canchas.
*   Gestión de Base de Datos: ORM para interacciones seguras y eficientes con la base de datos relacional.
*   Arquitectura Modular: Construido con NestJS, favoreciendo la escalabilidad y mantenibilidad del código.

---

⚙️ Funcionalidad Detallada

Funcionalidad Actual (MVP)

*   Gestión de Usuarios y Roles: Creación y autenticación de usuarios (Administradores, Dueños de Club, Usuarios regulares).
*   Gestión de Clubes y Canchas: ABM (Alta, Baja, Modificación) de complejos deportivos y sus respectivas canchas, incluyendo precios y disponibilidad.
*   Lógica de Reservas: Validación de superposición de turnos, confirmación de disponibilidad y registro de transacciones.
*   Tareas Programadas (Cron Jobs): Verificación automática de la fecha de vencimiento de las suscripciones de los clubes para desactivarlos a ellos y a sus canchas si no han pagado.

---

 🛠️ Stack de Tecnología

Este proyecto está construido con un stack de tecnologías moderno para el desarrollo backend, asegurando rendimiento y estructura:

   Framework Principal: NestJS (Node.js)
   Lenguaje: TypeScript
   Base de Datos: MySQL
   ORM: TypeORM (para mapeo objeto-relacional)
   API de Datos: Soporte para GraphQL y Apollo Server
   WebSockets: Socket.IO para comunicación en tiempo real
   Tareas Programadas: @nestjs/schedule (Cron Jobs)
   Pruebas: Jest (Unit testing y E2E)

---

 🚀 Cómo Empezar (Guía de Desarrollo)

Para levantar el entorno de desarrollo local y empezar a contribuir, sigue estos pasos:

1.  Clonar el repositorio y ubicarse en la carpeta Backend:
    ```bash
    git clone [URL-DEL-REPOSITORIO]
    cd canchaya/canchaYa - BACKEND
    ```
2.  Tener instalado Node.js o instalarlo para utilizar comandos npm.

3.  Instalar dependencias:
    ```bash
    npm install
    ```

4.  Configurar las variables de entorno:
    Crear un archivo `.env` en la raíz del backend con las credenciales de la base de datos MySQL y otras configuraciones necesarias.

5.  Ejecutar el servidor de desarrollo:
    ```bash
    npm run start:dev
    ```

6.  La API estará disponible en el puerto configurado (usualmente http://localhost:3000).

Scheneider Querian, Cabrera Dario, Garcia Marcelo y Arenzana Bruno.

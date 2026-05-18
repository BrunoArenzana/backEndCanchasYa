# Módulo Cron

Este módulo contiene tareas programadas que se ejecutan automáticamente en intervalos de tiempo definidos.

## Archivos y Funciones

- **reviewPay.cron.ts**: Define una tarea que se ejecuta todos los días a la medianoche (`EVERY_DAY_AT_MIDNIGHT`). Su función principal es revisar la fecha de vencimiento de los pagos de cada club. Si un club tiene una deuda vencida, el sistema cambia automáticamente su estado (y el de su dueño) a 'inactivo'.

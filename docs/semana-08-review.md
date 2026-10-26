# Revisión de semana 8 · Ulises

La base aa40394 de develop tenía CI verde, las unitarias reales de Fátima y los tres E2E de permisos de Janeth. El flujo completo de captura offline estaba declarado como pendiente. Esta ampliación lo implementa en feature/semana-8-flujo-offline, con destino exclusivo a develop mediante PR.

## Estado actual

- Captura sintética real en /inspecciones, conectada a persistencia y cola.
- Recarga offline con el HTML y los chunks de Next cacheados por el Service Worker.
- Sincronización al reconectar y reintento manual, con confirmación HTTP para cambiar el estado local.
- Endpoint sintético persistente POST/GET con clave de operación, control de conflicto y un registro por ID.
- Se conservan los tres E2E de Janeth y las unitarias reales de Fátima.
- Se añaden flujo offline completo, captura guardada con permisos denegados, API real idempotente y registro tardío del Service Worker.

## Diagnóstico y decisiones

La versión inicial solo tenía cola persistente sin consumidor en pantalla, no tenía endpoint y el Service Worker apuntaba a iconos inexistentes y no cacheaba los chunks. Además, registrar solamente en load podía perder el evento si la hidratación ocurría después. Las correcciones y los límites están en docs/offline-flow.md. La estrategia del equipo está en docs/test-strategy.md.

Los tests históricos se conservan como JavaScript ejecutado por el loader; TypeScript estricto comprueba la aplicación, las unitarias TS y los E2E TS. c8 mide cobertura de pruebas Node, no cobertura de los E2E.

## Evidencia de regresión

Se mantienen evidence/semana08/controlled-failure.txt y controlled-recovery.txt: retirar Idempotency-Key provocó dos registros y restaurarla recuperó la prueba. Se conserva la evidencia de Fátima y Janeth, sin atribuirles esta ampliación de código.

## Límites

El backend JSON requiere un único proceso Node y disco persistente; no es una base de datos de producción. Solo admite nuevas inspecciones sintéticas, no edición o borrado desde la UI. No se guardan fotos ni coordenadas físicas. La cola conserva el límite de tres intentos; una operación descartada no marca su captura como sincronizada. No se garantiza concurrencia entre pestañas.

## Entrega

El SHA aa40394 corresponde a la versión anterior. Después de integrar este PR se debe registrar el nuevo SHA de develop y revisar Actions de esa versión. La validación humana de Ulises continúa pendiente hasta que revise y reproduzca los resultados; los comandos ejecutados por Codex no se presentan como propios. No se modifica main ni se realiza entrega en Classroom desde esta conversación.

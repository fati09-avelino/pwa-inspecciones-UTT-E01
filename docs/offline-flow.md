# Flujo offline y sincronización de semana 8

La pantalla /inspecciones incluye una captura de texto conectada al almacenamiento
local y a la cola real. El listado original de ejemplos se conserva por separado.
Solo se admiten datos sintéticos; los IDs nuevos tienen prefijo SYNTH-.

## Flujo y decisiones

1. El formulario usa validateInspection del proyecto y exige resumen no vacío.
   Guarda el registro en utt_pwa_inspections y su operación CREATE en
   utt_pwa_sync_queue. Si encolar falla, restaura el listado anterior y muestra un error.
2. Las capturas se reconstruyen desde LocalStorage al montar la página. Las imágenes
   y coordenadas del componente de capacidades siguen siendo apoyos de sesión: no
   se guardan imágenes ni ubicación física en el nuevo almacén.
3. Al reconectar se intenta sincronizar; también existe un botón manual. Se impiden
   dos sincronizaciones simultáneas dentro de la misma pestaña. Solo una respuesta
   HTTP satisfactoria cambia una captura a Sincronizada.
4. /api/inspecciones implementa POST y GET para la demostración sintética. Persiste
   registros y claves de idempotencia en un archivo JSON mediante escritura temporal
   y renombrado, serializando las escrituras del proceso. La misma clave y contenido
   devuelve el mismo registro; contenido distinto devuelve 409. También se mantiene
   un único registro por ID.
5. El Service Worker precachea /inspecciones, sus chunks y estilos reales de Next,
   y los iconos en sus rutas correctas. Navegación usa red con recuperación del caché;
   recursos estáticos usan caché. No intercepta la API ni peticiones RSC. Se registra
   incluso si el componente se hidrata después del evento load.
6. Todo se construye en una rama propia con destino a develop mediante PR. main no
   forma parte de esta integración.

## Pruebas

- tests/e2e/flujo-offline.spec.ts: crear sin red, guardar, recargar estando offline,
  reconectar, sincronizar y comprobar por la API que existe un solo registro.
  Incluye otra captura que termina guardada con cámara y ubicación denegadas.
- tests/e2e/api-idempotencia.spec.ts: dos POST idénticos al endpoint real y un intento
  de reutilizar la clave con contenido distinto; exige un registro y respuesta 409.
- Se conservan las tres pruebas de permisos de Janeth.
- tests/unit/sw-registration.spec.mjs cubre la hidratación después de load.
- Se conservan las seis pruebas de integración con LocalStorage real y remoto controlado.
- Los E2E arrancan el build de producción en 127.0.0.1:3008. Cada ejecución usa un
  archivo .pwa-data/e2e-<PID>.json propio; cada caso genera IDs sintéticos nuevos.
  No se limpia un almacén personal ni se usan cuentas externas.

Comandos: npm ci, npx playwright install chromium, npm run verify (equivale a make verify).
Para ejecutar E2E por separado: npm run build y npm run test:e2e.

## Límites

El servidor de demostración requiere Node y un sistema de archivos con escritura.
El archivo .pwa-data/inspections.json se conserva entre reinicios en el mismo equipo,
pero no es una base de datos de producción ni sirve para múltiples procesos,
despliegues serverless o almacenamiento efímero. No existe autenticación: el endpoint
solo es una demostración con datos sintéticos y no debe recibir datos reales.

La cola anterior conserva su límite de tres intentos y puede descartar una operación;
el registro local no se marca como sincronizado por ese descarte. No se garantiza
concurrencia entre pestañas ni ediciones posteriores de una operación ya aplicada.
Solo se prueba Chromium. No se persisten fotografías ni coordenadas reales.

## Evidencia y autoría

Codex escribió esta ampliación y ejecutó sus comprobaciones bajo la autorización de
Ulises. La validación humana no se declara realizada por el simple uso de IA. La
evidencia previa de Fátima y Janeth se conserva. El SHA aa40394 pertenece a la versión
anterior, que no implementaba el flujo completo; la entrega debe usar el nuevo SHA
de develop únicamente después de integrar este PR y revisar su propia ejecución de CI.

# E2E de semana 8

- capacidades-denegadas.spec.ts: tres casos originales de Janeth sobre fallbacks.
- flujo-offline.spec.ts: flujo completo offline con recarga real y captura guardada con capacidades denegadas.
- api-idempotencia.spec.ts: reenvío y conflicto en el endpoint real.

Ejecutar npm run build y npm run test:e2e, o npm run verify para todas las etapas.
Playwright inicia el servidor de producción en 127.0.0.1:3008 y usa .pwa-data/e2e-<PID>.json.
Cada contexto tiene almacenamiento aislado y cada registro tiene un ID sintético único.

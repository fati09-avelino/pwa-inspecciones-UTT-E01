# E2E de semana 8 · pendiente de integrar por Janeth

Usar Playwright (@playwright/test) con archivos *.spec.ts, *.spec.js o *.spec.mjs.
npm run test:e2e arranca npm run start -- --hostname 127.0.0.1 --port 3008.
Ejecutar npm run build antes. El servidor se detiene al terminar.
Cada caso recibe un contexto nuevo.

Escenarios desde la interfaz:
1. Crear → guardar offline → recargar offline → reconectar → sincronizar una sola vez.
2. Denegar cámara o ubicación y completar la captura con el fallback visible.

Integración llama a módulos directamente y NO sustituye los E2E.
Aún faltan tests ejecutables; el comando y el workflow deben fallar hasta integrarlos.

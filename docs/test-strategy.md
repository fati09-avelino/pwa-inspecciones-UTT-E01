# Estrategia de pruebas (Semana 8)

Proyecto: PWA de inspecciones y mantenimiento de laboratorios (UTT, Grupo 10 A, Equipo 1). Solo datos sintéticos.

## 1. Riesgos y qué capa los cubre

| Riesgo | Por qué importa | Capa que lo cubre |
| :--- | :--- | :--- |
| Se guarda una inspección inválida (datos vacíos) | Datos basura en la cola y en el servidor | Unitaria (`tests/unit/logic.spec.ts`) |
| La cola duplica una inspección | Registros repetidos al sincronizar | Unitaria + integración |
| Se pierde la cola al recargar o se duplica al reintentar tras perder una respuesta | Pérdida o duplicación de trabajo en campo | Integración (`tests/integration/sync.spec.mjs`, Chromium + LocalStorage real) |
| El servidor responde 503 | La sincronización no debe perder datos | Integración |
| Cámara o ubicación denegadas dejan al usuario bloqueado | No se puede adjuntar evidencia | E2E (`tests/e2e/capacidades-denegadas.spec.ts`) |
| El flujo completo desde la pantalla (crear, guardar offline, recargar, reconectar, sincronizar una sola vez) falla | Es el flujo crítico del producto | E2E real: `tests/e2e/flujo-offline.spec.ts` |

## 2. Justificación de las capas

- **Unitarias:** son rápidas y aíslan la lógica (validación y regla de la cola) sin navegador. Se importan las funciones reales de `src/`; solo se simula `localStorage` en memoria.
- **Integración:** usa la cola real y el `LocalStorage` real de Chromium, con un documento y un remoto simulados (fixtures en `tests/fixtures/`). Detecta fallos de persistencia y de reintento que las unitarias no ven. No sustituye a los E2E: no pasa por la interfaz.
- **E2E (Playwright):** abre la app construida (`npm run build` + `npm run start`, puerto 3008) y actúa como una persona. Es la capa más lenta y frágil, por eso solo cubre los flujos críticos.

## 3. Diagnóstico inicial

- Las pruebas unitarias iniciales (commit `2a75640`) probaban funciones definidas dentro del propio test, no las del proyecto. Pasaban aunque el código real estuviera roto. Se corrigieron en `a18ff92`, que ya importa el código real.
- Las funciones de cámara, ubicación y avisos existían pero ninguna capa probaba la pantalla; las 26 pruebas de `capabilities.spec.ts` simulan las APIs en Node.
- Al integrar la rama de CI, `npm run verify` fallaba por faltar `docs/test-strategy.md` y los E2E ejecutables (`tests/e2e/README.md` lo dejaba explícito).
- Inicialmente no existía un formulario conectado a persistencia y cola. La ampliación documentada en `docs/offline-flow.md` incorpora esa captura, el endpoint sintético y la recarga offline real.

## 4. Evidencia de fallo y recuperación

**Defecto controlado de la capa unitaria (Fátima).** Se alteró la condición de `src/lib/sync/queue.ts` para aceptar duplicados. La prueba falló con `AssertionError (2 !== 1)`; al restaurar el código volvió a pasar. Capturas: `evidence/defecto-cola.png` (fallo) y `evidence/recuperacion-cola.png` (recuperación).

**Defecto controlado de la capa de integración (Héctor).** Se retiró temporalmente la clave de idempotencia; la prueba de respuesta perdida observó dos registros en lugar de uno. Salidas: `evidence/semana08/controlled-failure.txt` y `controlled-recovery.txt`.

**Fallo encontrado en una semana anterior que ninguna prueba automática vio:** la espera infinita de `serviceWorker.ready` en "Simular Cambio de Estado" (Semana 6). Se detectó solo probando en pantalla, lo que justifica tener una capa E2E.

## 5. E2E implementados

`tests/e2e/capacidades-denegadas.spec.ts` niega cámara y ubicación (se sustituyen `navigator.mediaDevices.getUserMedia` y `navigator.geolocation` antes de cargar la página) y comprueba:

1. Cámara denegada: aparece "Cámara no disponible o permiso denegado" y la imagen se adjunta por el selector de archivos (fallback), sin `alert()`.
2. Ubicación denegada: aparece el aviso y la app sigue utilizable.
3. Ambas denegadas: los dos fallbacks conviven y la captura termina.

## 6. Flujo completo y límites

- **E2E 1 implementado:** `tests/e2e/flujo-offline.spec.ts` usa el formulario real, corta la red del contexto, recarga offline, reconecta y exige una sola inspección mediante la API real. También guarda una captura tras denegar capacidades. `tests/e2e/api-idempotencia.spec.ts` comprueba reenvío y conflicto contra el endpoint persistente. Véase `docs/offline-flow.md` para decisiones y límites del servidor sintético.
- Los E2E usan APIs sustituidas en el navegador, no permisos reales del sistema operativo.
- Solo se prueba Chromium; no se probó en dispositivo móvil físico.
- Los tres E2E originales de permisos demuestran los fallbacks; el nuevo caso de flujo añade una inspección efectivamente guardada. Las fotos y coordenadas no se persisten. El backend JSON es de demostración en un solo proceso Node, no de producción.
- Los resultados de `npm run verify` y de GitHub Actions se registran en la evidencia individual solo después de ejecutarlos.

## 7. Cómo ejecutar

```bash
npm ci
npx playwright install chromium
npm run build
npm run test:e2e
npm run verify        # equivalente a make verify
```
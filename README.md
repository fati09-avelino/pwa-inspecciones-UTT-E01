# PWA Inspecciones y Mantenimiento de Laboratorios - UTT

Proyecto integrador correspondiente a la materia de PWA (Grupo 10 A - Equipo 1). Usa exclusivamente datos sintéticos.

## Semana 9 · Seguridad, privacidad y CI

La aportación de Ulises parte de `develop` con la seguridad de Fátima integrada
(base `c7a8fe7`). [Modelo de amenazas](docs/threat-model.md): activos, flujos y
fronteras de confianza, 11 escenarios STRIDE priorizados, controles comprobados,
decisiones y riesgos pendientes. La sanitización y cabeceras son de Fátima;
el inventario de privacidad y `robots.txt` corresponden a Janeth en su propia rama.

### Instalación y verificación reproducible

Requisitos: Node **22.22.0**, npm 10 o superior y Chromium de Playwright.
Desde la raíz del repositorio:

```sh
npm ci
npx playwright install chromium
npm run test:security
make verify
npm run verify:w09
```

En Windows sin GNU Make, `npm run verify` es el equivalente exacto de
`make verify` (mismo `scripts/verify.mjs`). En Linux CI se instala Chromium con
`npx playwright install --with-deps chromium`.
La verificación completa ejecuta lint, tipos, build, pruebas Node con cobertura,
integración y todos los E2E. Para repetir únicamente los tres nuevos escenarios:

```sh
npm run build
npm run test:e2e -- tests/e2e/security-boundaries.spec.ts
npm audit --omit=dev --json
```

`test:security` ejecuta las dos pruebas reales de Fátima; también están incluidas
en la suite Node general. Los nuevos E2E comprueban cabeceras HTTP y bloqueo CSP
de un script externo, entradas maliciosas renderizadas como texto después de
guardar/recargar y rechazo API de JSON inválido/datos excesivos sin persistirlos.
No prueban autenticación, un pentest completo ni privacidad en dispositivos físicos.

### Workflow y evidencia

`.github/workflows/week-09-w09-security-privacy.yml` corre en push a ramas de
trabajo/develop, en PR **hacia develop** y manualmente. Instala desde lockfile,
ejecuta seguridad y verificación completa, y guarda reportes/trazas/cobertura
durante 14 días incluso al fallar. Usa permisos de lectura, acciones fijadas por
SHA, checkout sin credenciales persistentes, sin secretos ni despliegues.
`reports/week09-context.json` identifica el SHA fuente y el evaluado (en PR puede
ser un merge temporal), además de la URL de Actions.

`npm run verify:w09` repite la verificación completa y comprueba entregables no
vacíos de Semana 9. Genera `evaluation-result.json` con SHA, estado y límites;
no asigna calificación ni simula los checks privados. Para diagnosticar solo la
estructura: `node scripts/verify-week09.mjs --structure`. Los archivos de Janeth
deben integrarse antes de obtener aprobación global; no se crean archivos vacíos
para aparentar que están terminados.

La auditoría npm es **informativa**, con advertencia y JSON conservado si detecta
hallazgos o no puede ejecutarse; las pruebas y build sí son bloqueantes. El
diagnóstico inicial del 30-10-2026 reportó 3 dependencias de producción vulnerables
(1 crítica: Next; 2 altas: postcss y source-map-js). Es un resultado del registro
en esa fecha, no una lista inmutable. No se ejecuta `npm audit fix --force`: la
solución propuesta migra Next de versión mayor y requiere un PR específico.
Un resultado verde no elimina esos pendientes. Consultar el JSON del SHA entregado.

Evidencia individual: [sección Semana 9 de Ulises](evidence/individual.md).
Cada integrante trabaja desde `develop` actualizado en su rama y abre PR hacia
`develop`; no se permiten commits ni fusiones directas a `main`.
La revisión humana de Ulises debe registrarse cuando realmente la haya hecho.

### Límites de seguridad conocidos

La API sintética no autentica ni autoriza usuarios; LocalStorage no está cifrado
ni protegido frente a scripts del mismo origen; CSP permite inline/eval; no hay
cuotas de almacenamiento ni rate limiting. El archivo JSON funciona en un solo
proceso. No introducir información personal, secretos ni fotografías reales.
El `robots.txt` de Janeth no será un control de acceso. Las mitigaciones pendientes
y sus responsables propuestos están identificados en el modelo.

## Arquitectura de la Semana 05: Persistencia Offline y Sincronización

En esta iteración se agrega la capa de datos offline y la sincronización diferida con el servidor:
- **Esquema de datos (`src/lib/storage/schema.ts`):** Tipos `InspectionItem`, `SyncQueueItem` y `ConflictResolutionResult` que definen la forma de los datos guardados localmente y en la cola.
- **Política de conflicto (`src/lib/sync/conflict-policy.ts`):** `resolveConflict` aplica Last-Write-Wins comparando `updatedAt`: si la versión local es estrictamente más reciente, prevalece y avanza `version` a partir de la del servidor; en caso de empate o si el servidor es más reciente, prevalece el servidor. `isDuplicateInQueue` detecta si un registro ya está pendiente, comparando por `id`.
- **Cola de sincronización (`src/lib/sync/queue.ts`):** `addToSyncQueue` guarda operaciones pendientes (`CREATE`/`UPDATE`/`DELETE`) en `localStorage`, evitando filas duplicadas por `id` (actualiza el payload existente en vez de agregar uno nuevo). `processSyncQueue` reintenta el envío de cada item (hasta 3 reintentos); si falla y no alcanza el límite, se reintenta después; si lo supera, se descarta y se cuenta como fallido. Es segura en SSR: sin `window`, las funciones no lanzan error y simplemente no persisten nada.
- **Política de sincronización (`docs/sync-policy.md`):** Documenta el flujo completo (captura offline → detección de conexión → despacho y reintentos), la prevención de duplicados y el límite de reintentos.
- **Pruebas Automatizadas (`tests/sync.spec.ts`):** 24 pruebas de comportamiento sobre `conflict-policy.ts` y `queue.ts` (resolución de conflictos, empates, altas sin duplicar, reintentos, descarte por límite, fallos controlados y el caso sin `window`).

## Arquitectura de la Semana 04: Renderizado CSR/SSR y Estados Verificables

En esta iteración se comparan dos estrategias de renderizado, una por ruta:
- **Ruta de Listado (`src/app/inspecciones/page.tsx`) — CSR:** Client Component. El servidor entrega solo el estado de carga; los datos sintéticos se piden en el navegador. Incluye filtro por estado y los estados de carga, error (con reintento) y vacío. La vista está en `src/components/inspections-view.tsx`.
- **Ruta de Detalle (`src/app/inspecciones/[id]/page.tsx`) — SSR:** Server Component asíncrono, parametrizado por ID. El HTML llega con los datos. Usa `loading.tsx` y `error.tsx` de su carpeta.
- **Componente de Carga (`src/components/loading-state.tsx`):** Indicador accesible (`role="status"`) reutilizado por la vista CSR y por `loading.tsx`.
- **Capa de datos (`src/lib/data/inspections-service.ts`):** Consulta simulada con latencia de 250 ms sobre datos sintéticos locales.
- **Estrategia de Renderizado (`docs/rendering-decision.md`):** Decisiones de arquitectura, trade-offs, supuestos y límites.

---

## Setup, Ejecución y Verificación

Requisitos: Node.js 22.22.x (CI: 22.22.0), npm 10 o posterior y Git.

### 1. Instalación inmutable
```bash
npm ci
```

### 2. Ejecución local
```bash
npm run dev
```
Abre http://localhost:3000. Rutas principales: `/` (pantalla inicial), `/inspecciones` (listado CSR) y `/inspecciones/INS-001` (detalle SSR). Detén el servidor con Ctrl+C.

### 3. Pruebas automatizadas
```bash
npm run test
```
Ejecuta, en orden: starter, manifiesto, Service Worker, comportamiento offline, renderizado CSR/SSR y sincronización (`sync.spec.ts`).

### 4. Build de producción
```bash
npm run build
```

### 5. Verificación completa
```bash
npm run verify
```
Ejecuta lint, tipos, build, pruebas con cobertura, integración y E2E, y genera `reports/verification.json`. Un resultado técnico "pass" no es una calificación. También existe el check de estructura: `bash public-tests/check.sh`.

---

## Evidencia

- **Evidencia individual:** `evidence/individual.md` (una sección por integrante).
- **Reporte de verificación:** `reports/verification.json`, generado localmente con `npm run verify`; no se versiona en Git a propósito.
- **GitHub Actions:** cada push y cada Pull Request ejecutan los workflows de `.github/workflows/`; el enlace de la ejecución del commit evaluado se entrega en Classroom.

## Flujo de trabajo

El trabajo se hace en ramas propias y se integra por Pull Request a `develop`. Esta ampliación no modifica `main`.

## Arquitectura de la Semana 06: Capacidades del Dispositivo y Notificaciones

En esta iteración se agregan capacidades opcionales del dispositivo, siempre con permisos mínimos y un fallback cuando no están disponibles:
- **Cámara (`src/lib/device/camera.ts`):** `requestCameraPermission` comprueba el permiso pidiendo solo video y apaga las pistas de inmediato. `getFallbackFileInput` ofrece un campo de archivo (solo imágenes) cuando no hay cámara o se deniega el permiso.
- **Geolocalización (`src/lib/device/geolocation.ts`):** `getCurrentLocation` devuelve únicamente latitud, longitud y precisión, con baja precisión y una espera máxima de 10 segundos. Si no hay soporte o se deniega el permiso, devuelve `null`.
- **Notificaciones (`src/lib/notifications/client.ts`):** `requestNotificationPermission` y `sendLocalNotification`. Muestran el aviso con el Service Worker si está activo, o con `Notification` en caso contrario. Sin soporte o sin permiso, dejan un aviso en consola y devuelven `false`.
- **Documentación (`docs/capabilities.md`):** decisiones, permisos y límites de cada capacidad.
- **Pruebas Automatizadas (`tests/capabilities.spec.ts`):** 26 pruebas de comportamiento. Verifican que importar los módulos no pide permisos, que se piden solo los mínimos, que no se recolectan más datos de los necesarios y que cada fallback funciona sin lanzar errores y capacidades del dispositivo (capabilities.spec.ts).

## Semana 08: integración y CI (Ulises)

La aportación está en `tests/semana-8-integracion-ci`, basada en `develop`. Diagnóstico y coordinación en [docs/semana-08-review.md](docs/semana-08-review.md). La estrategia final del equipo corresponde a [docs/test-strategy.md](docs/test-strategy.md), ya integrada por Janeth.

| Comando | Qué verifica |
| --- | --- |
| `npm ci` | Instalación reproducible del lockfile |
| `npx playwright install chromium` | Navegador local de pruebas; en Linux CI se añade `--with-deps` |
| `npm run dev` | Desarrollo en localhost:3000 |
| `npm run lint` | ESLint de src, sin avisos permitidos |
| `npm run typecheck` | TypeScript estricto de src, unitarias TS y E2E TS; los históricos JS se ejecutan, no se tipan |
| `npm run build` | Compilación de producción Next |
| `npm run test:unit` | Unitarias de Fátima en tests/unit |
| `npm run test:legacy` | Suites previas, incluida sincronización de semana 5 |
| `npm run test:coverage` | Todos los tests Node y cobertura c8 con mapas de código fuente |
| `npm run test:integration` | Seis casos en Chromium con LocalStorage real, sin servidor personal |
| `npm run test:e2e` | Seis casos: permisos, flujo offline con recarga, captura guardada y API real idempotente |
| `make verify` | Todas las etapas, reporte final y salida de error si alguna falla |
| `npm run verify` | Equivalente exacto de make verify en Windows sin Make |

`npm test` ejecuta las tres capas de pruebas; ejecutar `npm run build` antes para los E2E. El verificador completo hace ese build automáticamente.

### Fixtures y contrato remoto

Los datos están en `tests/fixtures/inspection.json`. El fixture de navegador empaqueta el `queue.ts` real, intercepta únicamente documento y remoto, y crea un contexto aislado por prueba. La respuesta perdida se simula **después** de aplicar la operación. Se comprueba que dos envíos llevan la misma `Idempotency-Key` y existe un solo registro remoto. El endpoint sintético de esta ampliación implementa ese contrato y tiene su propia prueba contra el servidor real. El fixture no sustituye el E2E de la interfaz ni prueba un backend desplegado.

### Reportes y GitHub Actions

El workflow de semana 2 equivalente se actualizó/movió a `.github/workflows/academic-evaluation.yml`. En cada push/PR instala con `npm ci`, instala Chromium y ejecuta `make verify`. No omite etapas faltantes ni tolera tests ausentes. Los artefactos `semana-08-<SHA>` se conservan 14 días, incluso con fallos:

- `reports/verification.json` y logs de cada etapa.
- `reports/node/all.xml`, `reports/integration/junit.xml`, `reports/e2e/junit.xml`.
- Reportes HTML de integración y E2E; traces de fallo en `test-results/`.
- `coverage/lcov.info`, `coverage/index.html`, `coverage/coverage-summary.json`.

La cobertura corresponde a pruebas Node de src/lib y src/components; no mide E2E ni exige un porcentaje mínimo. Los reportes generados no se versionan. La evidencia pequeña de fallo/corrección está en `evidence/semana08/`.

### Contrato E2E para integrar la aportación de Janeth

`playwright.config.mjs` busca `tests/e2e/*.spec.ts`, `.spec.js` o `.spec.mjs`, arranca `npm run start -- --hostname 127.0.0.1 --port 3008`, espera `/inspecciones`, usa `baseURL=http://127.0.0.1:3008` y detiene el servidor al terminar. No reutiliza un servidor personal. El formulario, la persistencia, la recarga offline y la sincronización están conectados. Las unitarias de Fátima importan funciones reales; se conservan los E2E de Janeth y se añaden los casos de flujo completo y endpoint. Véase docs/offline-flow.md para límites y decisiones.

### Evidencia individual y entrega

Consultar la sección de Ulises en `evidence/individual.md`. Los comandos ejecutados por Codex no equivalen a validación humana ya realizada. Revisar personalmente el diff, los tests y sus resultados. Tras el último cambio integrado, copiar `git rev-parse HEAD`, comprobar el mismo SHA en Actions y entregar ese SHA y enlaces en Classroom; no hacer otro commit para escribir el SHA del propio commit. La fecha/hora exactas y el acceso del docente todavía requieren comprobación en Classroom.

## Ampliación: flujo offline completo

La captura en `/inspecciones` guarda texto sintético y encola su operación real.
Permite recargar sin red, sincroniza al reconectar y ofrece reintento manual.
`POST /api/inspecciones` persiste registros sintéticos con idempotencia; `GET`
permite consultar la demostración. El servidor requiere Node y disco con escritura.
La carpeta `.pwa-data/` está excluida de Git y no es una base de datos de producción.
No se guardan fotografías ni coordenadas reales. Los límites de cola y concurrencia
siguen descritos en [docs/offline-flow.md](docs/offline-flow.md).

El flujo antes pendiente ahora está cubierto por `tests/e2e/flujo-offline.spec.ts`.
También se verifica el endpoint real en `tests/e2e/api-idempotencia.spec.ts` y el
registro tardío del Service Worker en `tests/unit/sw-registration.spec.mjs`.
Se conservan las pruebas de Janeth y Fátima. Los E2E usan un archivo sintético por
proceso de prueba y no requieren cuentas ni permisos físicos del evaluador.

Esta ampliación se integra por PR a **develop**. El SHA aa40394 y sus checks verdes
corresponden a la versión anterior. La nueva entrega debe identificar el SHA y los
reportes de la versión ampliada, sin atribuir validación humana a ejecuciones de IA.

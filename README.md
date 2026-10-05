# PWA Inspecciones y Mantenimiento de Laboratorios - UTT

Proyecto integrador correspondiente a la materia de PWA (Grupo 10 A - Equipo 1). Usa exclusivamente datos sintéticos.

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

Requisitos: Node.js 20.19 o posterior, npm 10 o posterior y Git.

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
Ejecuta las pruebas y el build, y genera `reports/verification.json`. Un resultado técnico "pass" no es una calificación. También existe el check de estructura: `bash public-tests/check.sh`.

---

## Evidencia

- **Evidencia individual:** `evidence/individual.md` (una sección por integrante).
- **Reporte de verificación:** `reports/verification.json`, generado localmente con `npm run verify`; no se versiona en Git a propósito.
- **GitHub Actions:** cada push y cada Pull Request ejecutan los workflows de `.github/workflows/`; el enlace de la ejecución del commit evaluado se entrega en Classroom.

## Flujo de trabajo

El trabajo se hace en ramas (`feature/...`, `fix/...`, `tests/...`, `docs/...`) sobre `develop`, y se integra a `main` mediante Pull Request; no se sube directo a `main` ni a `develop`.

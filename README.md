# PWA Inspecciones y Mantenimiento de Laboratorios - UTT

Proyecto integrador correspondiente a la materia de PWA (Grupo 10 A - Equipo 1). Usa exclusivamente datos sintéticos.

## Arquitectura de la Semana 04: Renderizado CSR/SSR y Estados Verificables

En esta iteración se comparan dos estrategias de renderizado, una por ruta:
- **Ruta de Listado (`src/app/inspecciones/page.tsx`) — CSR:** Client Component. El servidor entrega solo el estado de carga; los datos sintéticos se piden en el navegador. Incluye filtro por estado y los estados de carga, error (con reintento) y vacío. La vista está en `src/components/inspections-view.tsx`.
- **Ruta de Detalle (`src/app/inspecciones/[id]/page.tsx`) — SSR:** Server Component asíncrono, parametrizado por ID. El HTML llega con los datos. Usa `loading.tsx` y `error.tsx` de su carpeta.
- **Componente de Carga (`src/components/loading-state.tsx`):** Indicador accesible (`role="status"`) reutilizado por la vista CSR y por `loading.tsx`.
- **Capa de datos (`src/lib/data/inspections-service.ts`):** Consulta simulada con latencia de 250 ms sobre datos sintéticos locales.
- **Estrategia de Renderizado (`docs/rendering-decision.md`):** Decisiones de arquitectura, trade-offs, supuestos y límites.
- **Pruebas Automatizadas:** `tests/rendering.spec.ts` (CSR vs SSR, estados y filtro), `tests/service-worker.spec.ts` y `tests/offline.spec.ts` (Service Worker y comportamiento offline).

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
Ejecuta las pruebas del starter, del manifiesto, del Service Worker, del comportamiento offline y del renderizado.

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

El trabajo se hace en ramas (`feature/...` o `fix/...`) y se integra a `main` mediante Pull Request; no se sube directo a `main`.

## Arquitectura de la Semana 06: Capacidades del Dispositivo y Notificaciones

En esta iteración se agregan capacidades opcionales del dispositivo, siempre con permisos mínimos y un fallback cuando no están disponibles:
- **Cámara (`src/lib/device/camera.ts`):** `requestCameraPermission` comprueba el permiso pidiendo solo video y apaga las pistas de inmediato. `getFallbackFileInput` ofrece un campo de archivo (solo imágenes) cuando no hay cámara o se deniega el permiso.
- **Geolocalización (`src/lib/device/geolocation.ts`):** `getCurrentLocation` devuelve únicamente latitud, longitud y precisión, con baja precisión y una espera máxima de 10 segundos. Si no hay soporte o se deniega el permiso, devuelve `null`.
- **Notificaciones (`src/lib/notifications/client.ts`):** `requestNotificationPermission` y `sendLocalNotification`. Muestran el aviso con el Service Worker si está activo, o con `Notification` en caso contrario. Sin soporte o sin permiso, dejan un aviso en consola y devuelven `false`.
- **Documentación (`docs/capabilities.md`):** decisiones, permisos y límites de cada capacidad.
- **Pruebas Automatizadas (`tests/capabilities.spec.ts`):** 26 pruebas de comportamiento. Verifican que importar los módulos no pide permisos, que se piden solo los mínimos, que no se recolectan más datos de los necesarios y que cada fallback funciona sin lanzar errores y capacidades del dispositivo (capabilities.spec.ts).
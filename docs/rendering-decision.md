# Informe de Decisiones de Renderizado y Arquitectura (Semana 04)

> Corrige lo que el código real hace hoy: el listado es CSR, el detalle es SSR, y el
> componente de carga sí queda conectado (vista CSR y `loading.tsx`).

## 1. Estrategia de renderizado adoptada

La PWA usa **dos estrategias distintas a propósito**, una por ruta, para poder compararlas con evidencia real:

| Ruta | Estrategia | Por qué esa |
| :--- | :--- | :--- |
| `/inspecciones` (listado) | **CSR** (Client Component) | Es una pantalla interactiva: filtra por estado sin recargar la página. |
| `/inspecciones/[id]` (detalle) | **SSR** (Server Component `async`) | Es contenido de lectura que se abre por enlace directo; conviene que el HTML llegue con los datos. |

### Ruta A: Listado — `/inspecciones` (CSR)
- **Implementación:** `src/app/inspecciones/page.tsx` usa `'use client'`, `useState` y `useEffect`. La presentación está en `src/components/inspections-view.tsx`.
- **Qué llega del servidor:** solo el cascarón con el estado de carga. Los registros se piden en el navegador con `fetchInspections()` y aparecen después. En `next build` la ruta figura como `○ Static` con unos 2 kB de JavaScript de cliente.
- **Estados:** carga (`LoadingState`, `role="status"`), error con botón *Reintentar* (`role="alert"`), vacío ("No hay inspecciones para mostrar") y con datos.
- **Interacción:** filtro por estado (Todas / Pendiente / En revisión / Completada) con `aria-pressed`, que se aplica en el cliente sin nuevas peticiones.

### Ruta B: Detalle — `/inspecciones/[id]` (SSR)
- **Implementación:** `src/app/inspecciones/[id]/page.tsx` es un Server Component `async` que espera `fetchInspectionById(id)`. En `next build` figura como `ƒ` (renderizada en el servidor bajo demanda).
- **Qué llega del servidor:** el HTML ya trae laboratorio, ubicación, hallazgos y notas, sin depender de JavaScript en el navegador.
- **Carga:** `src/app/inspecciones/[id]/loading.tsx` reutiliza `LoadingState` y Next.js lo muestra mientras el servidor espera los datos.
- **Errores:** `src/app/inspecciones/[id]/error.tsx` (Client Component) captura fallos inesperados y ofrece *Reintentar*. Un identificador inexistente muestra un panel "Inspección no encontrada" con enlace de regreso al listado (la respuesta HTTP sigue siendo 200; no se usa `notFound()`).

### Componente de carga reutilizable — `src/components/loading-state.tsx`
Spinner con `role="status"` y `aria-live="polite"`. Se usa en la vista CSR del listado y en el `loading.tsx` del detalle.

## 2. Datos y supuestos

- Los datos son **sintéticos y locales** (`src/lib/data/inspections.ts`). No hay API ni base de datos.
- `src/lib/data/inspections-service.ts` simula una consulta con **250 ms de latencia** para que los estados de carga se puedan ver y probar. Las pruebas usan latencia 0.
- Por eso las diferencias de rendimiento entre CSR y SSR **no están medidas** en este proyecto; la comparación de la sección 4 es de arquitectura, no de mediciones.

## 3. Soporte offline

El Service Worker (`public/sw.js`) precachea `/` y `/manifest.webmanifest` al instalarse. Si una navegación falla por falta de red y el recurso no está en caché, entrega el fallback cacheado (`/`). Esto **no** guarda las páginas de inspecciones ni sus datos: sin conexión no se puede abrir un detalle que no se haya cacheado antes. Guardar datos para uso offline queda para semanas posteriores.

## 4. Trade-offs entre CSR y SSR

| Criterio | CSR (listado) | SSR (detalle) |
| :--- | :--- | :--- |
| Primer contenido útil | Más tardío: primero el cascarón, luego los datos. | Más temprano: el HTML ya incluye los datos. |
| JavaScript en el cliente | Más (≈2 kB propios de la ruta). | Casi nada propio de la ruta (≈0.2 kB). |
| Interacción sin recargar | Directa (filtro instantáneo). | Requeriría nueva petición al servidor. |
| Estados de carga | Los controla el componente en el navegador. | Los gestiona Next.js con `loading.tsx` (streaming). |
| Accesibilidad | Debe anunciar los cambios (`role="status"`, `role="alert"`). | El contenido llega completo; los estados usan los mismos roles. |
| Dependencia del servidor | Baja una vez cargado el cascarón. | Cada visita necesita el servidor. |

## 5. Límites y riesgos conocidos

- La latencia es simulada; no se probó con red real ni en un navegador real.
- El fallback offline solo cubre la página raíz.
- Las pruebas (`tests/rendering.spec.ts`) renderizan con `react-dom/server`; comprueban HTML, estados y callbacks, pero no ejecutan `useEffect` en un navegador.

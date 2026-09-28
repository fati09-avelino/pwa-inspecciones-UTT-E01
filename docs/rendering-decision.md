# Informe de Decisiones de Renderizado y Arquitectura (Semana 04)

## 1. Estrategia de Renderizado Adoptada

Para la PWA de Inspecciones de Laboratorios de la UTT, se implementó una estrategia de **Server-Side Rendering (SSR)** mediante Server Components de Next.js App Router para las rutas principales de listado y detalle.

### Ruta A: Listado de Inspecciones (`/inspecciones`) — SSR
- **Estrategia:** Server Component (`export default async function InspeccionesPage()`).
- **Comportamiento Real:** Obtiene directamente la colección de inspecciones sintéticas en el servidor. Esto acelera el *First Contentful Paint* (FCP) y reduce la carga de procesamiento en el dispositivo cliente.
- **Resiliencia y Estado Vacío:** Si la colección de datos no contiene registros, la vista captura la condición y renderiza un estado de error/vacío controlado de forma declarativa ("Error de carga").

### Ruta B: Detalle de Inspección (`/inspecciones/[id]`) — SSR
- **Estrategia:** Server Component parametrizado dinámicamente (`params: { id: string }`).
- **Comportamiento Real:** Procesa e hidrata la información detallada del laboratorio directamente en el servidor antes de enviar el HTML al navegador.
- **Manejo de Errores:** Si un identificador no existe en los datos sintéticos, retorna una respuesta de error 404 o estado de fallo controlado.

### Componente Reusable de Estado de Carga (`src/components/loading-state.tsx`)
- Implementa una animación de carga (*spinner* accesible) y un mensaje informativo de espera.
- Se utiliza dentro del flujo de Next.js para mejorar el *Perceived Performance* (rendimiento percibido) mientras se resuelven las peticiones asíncronas de servidor.

---

## 2. Soporte Offline y Resiliencia en PWA

Aunque las vistas se pre-renderizan en el servidor, la aplicación garantiza la continuidad de uso mediante el **Service Worker (`public/sw.js`)**:
1. **App Shell Precahceado:** La raíz (`/`) y el manifiesto (`/manifest.webmanifest`) se almacenan en caché durante la fase de instalación.
2. **Estrategia Fallback:** Si el dispositivo pierde conectividad al intentar navegar a una ruta, el Service Worker intercepta la petición `GET` de navegación y entrega el fallback cacheado en lugar de la pantalla de error nativa del navegador.

---

## 3. Matriz de Trade-offs y Rendimiento

| Criterio | Implementación SSR (`/inspecciones` y `/[id]`) | Enfoque CSR Alternativo |
| :--- | :--- | :--- |
| **Tiempo de Carga Inicial** | **Óptimo:** El servidor entrega el HTML con datos integrados. | Requiere descarga de JavaScript y petición adicional desde el cliente. |
| **Carga de CPU en Cliente** | **Baja:** El procesamiento de datos ocurre en el servidor. | Alta: El navegador debe ejecutar el renderizado completo. |
| **Respuesta Offline** | Gestionada mediante fallback por el Service Worker. | Directa si los datos están almacenados en la memoria/caché local. |
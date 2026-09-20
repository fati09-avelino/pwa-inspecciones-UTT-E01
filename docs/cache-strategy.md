# Estrategia de Caché y Políticas de Consistencia Offline (Semana 03)

## 1. Arquitectura y Ciclo de Vida del Service Worker

La PWA de Inspecciones de Laboratorios UTT utiliza un Service Worker (`public/sw.js`) diseñado para garantizar el acceso ininterrumpido a la interfaz base y recursos estáticos, incluso ante fallos de red o conectividad intermitente.

### Fases del Ciclo de Vida:
1. **Instalación (`install`):** 
   - Se abre el caché estático identificado por versión (ej. `v1-app-shell`).
   - Se realiza el precaché inmutable de los recursos críticos del App Shell: `/`, `/manifest.webmanifest`, estilos CSS y archivos de interfaz.
   - Se invoca `self.skipWaiting()` para forzar la activación sin quedar en estado de espera.

2. **Activación (`activate`):**
   - Se ejecuta el proceso de limpieza de versiones antiguas de caché (invalidation).
   - Se invoca `self.clients.claim()` para tomar el control de todos los clientes/pestañas abiertas de forma inmediata.

3. **Interceptación de Peticiones (`fetch`):**
   - Aplica estrategias diferenciadas según el tipo de recurso solicitado.


## 2. Estrategias de Caché Adoptadas

Para optimizar el rendimiento y prevenir servir datos obsoletos o corruptos, se implementó una **estrategia híbrida**:

### A. App Shell y Assets Estáticos (Cache First / Stale-While-Revalidate)
- **Estrategia:** *Cache First* con fallback a red para recursos estáticos (imágenes, fuentes, JS, CSS).
- **Justificación:** Los componentes de la interfaz no cambian con frecuencia; servirlos desde el caché garantiza tiempos de carga inmediatos en visitas subsecuentes.

### B. Navegación y Páginas HTML (Network First con Fallback Offline)
- **Estrategia:** *Network First*.
- **Justificación:** Intenta obtener siempre la versión más reciente del servidor. Si la red falla (offline) o la petición caduca por timeout, sirve la respuesta guardada en caché.
- **Respuesta de Fallback:** Si la página no está en caché y no hay conexión, redirige o sirve la página de respaldo offline para evitar la pantalla de error genérica del navegador ("Sin conexión").

### C. Datos Dinámicos / Inspecciones (Network Only / No Cache Indiscriminado)
- **Estrategia:** Peticiones de escritura o APIs dinámicas no se almacenan en caché sin validar.
- **Justificación:** Previene almacenar datos de inventario o inspecciones que requieran revalidación estricta, evitando condiciones de carrera o sobreescritura de datos sintéticos.


## 3. Políticas de Expiración e Invalidation

- **Control de Versiones:** Cada despliegue actualiza la constante del nombre del caché (`CACHE_NAME = 'utt-inspections-v1'`).
- **Limpieza Automática:** Durante el evento `activate`, se iteran las llaves de `caches.keys()` y se eliminan todas aquellas que no coincidan con la versión activa.
- **Actualización Segura:** Evita corrupción de estado mediante la estrategia de reemplazo atómico de caché previo a la toma de control de los clientes.


## 4. Limitaciones y Trade-Offs

1. **Persistencia de Datos:** Las inspecciones capturadas en modo completamente offline requieren ser encoladas en `IndexedDB` (planeado para iteraciones posteriores) para su sincronización en segundo plano (`Background Sync`).
2. **Caché Inicial:** Requiere una primera visita con conexión a internet para realizar el precaché completo de los componentes de la PWA.
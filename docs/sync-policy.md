# Política de Sincronización Offline y Gestión de Cola (Semana 05)

## 1. Arquitectura de Sincronización Offline

Para la PWA de Inspecciones de Laboratorio UTT, se diseñó un mecanismo de sincronización diferida que garantiza que los datos capturados en campo sin conexión a red no se pierdan.

### Flujo Operativo:
1. **Captura Offline:** Cuando no hay conexión a red, las operaciones (`CREATE`, `UPDATE`, `DELETE`) sobre las inspecciones se almacenan localmente en la cola de sincronización (`SyncQueueItem`).
2. **Detección de Conexión:** Al restablecer la red, el Service Worker o el manejador de eventos del cliente invoca la función `processSyncQueue()`.
3. **Despacho y Reintentos:** Se procesan secuencialmente las solicitudes pendientes. Si una petición falla, incrementa su contador de reintentos (`retries`).

---

## 2. Prevención de Duplicados y Gestión de Cola

Para evitar saturar la red o duplicar registros pendientes:
- **Actualización In-Place:** Si se intenta agregar a la cola un registro de inspección que ya tiene una operación pendiente, `addToSyncQueue` actualiza el `payload` y la marca de tiempo (`timestamp`) del ítem existente en lugar de agregar uno nuevo.
- **Límite de Reintentos (*Max Retries*):** Se establece un máximo de **3 reintentos** por elemento. Si un registro supera este umbral debido a fallos persistentes en el servidor o payload inválido, se descarta de la cola activa y se registra el evento para evitar bloqueos infinitos.

---

## 3. Resolución de Conflictos

La sincronización utiliza el modelo **Last-Write-Wins (LWW)** implementado en `src/lib/sync/conflict-policy.ts`:
- Si la marca de tiempo local (`updatedAt`) es estrictamente superior a la versión del servidor, la versión local prevalece e incrementa la versión (`version + 1`).
- Si la versión del servidor es igual o más reciente, prevalecen los datos del servidor para asegurar la consistencia del sistema central.
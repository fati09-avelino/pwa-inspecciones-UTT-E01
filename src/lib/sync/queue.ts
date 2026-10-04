import { SyncQueueItem, InspectionItem } from '../storage/schema';

const QUEUE_STORAGE_KEY = 'utt_pwa_sync_queue';
const MAX_RETRIES = 3;

/**
 * Obtiene la cola actual de elementos pendientes desde LocalStorage.
 */
export function getSyncQueue(): SyncQueueItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as SyncQueueItem[];
  } catch (error) {
    console.error('Error al parsear la cola de sincronización:', error);
    return [];
  }
}

/**
 * Guarda la cola de elementos en LocalStorage.
 */
export function saveSyncQueue(queue: SyncQueueItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

/**
 * Agrega un elemento a la cola de sincronización evitando duplicados.
 */
export function addToSyncQueue(
  payload: InspectionItem,
  action: 'CREATE' | 'UPDATE' | 'DELETE' = 'UPDATE',
  endpoint = '/api/inspecciones'
): SyncQueueItem[] {
  const queue = getSyncQueue();
  const existingIndex = queue.findIndex((item) => item.payload.id === payload.id);

  const newItem: SyncQueueItem = {
    id: `queue-${Date.now()}-${payload.id}`,
    action,
    endpoint,
    payload,
    timestamp: Date.now(),
    retries: 0
  };

  if (existingIndex >= 0) {
    // Si ya existía una acción pendiente para este ítem, la actualizamos con el nuevo payload
    queue[existingIndex] = {
      ...queue[existingIndex],
      payload,
      timestamp: Date.now()
    };
  } else {
    queue.push(newItem);
  }

  saveSyncQueue(queue);
  return queue;
}

/**
 * Procesa y envía los elementos pendientes de la cola de sincronización al servidor.
 * Controla el límite de reintentos y elimina los procesados con éxito.
 */
export async function processSyncQueue(
  sendFunction?: (item: SyncQueueItem) => Promise<boolean>
): Promise<{ processed: number; failed: number }> {
  const queue = getSyncQueue();
  if (queue.length === 0) return { processed: 0, failed: 0 };

  const remainingQueue: SyncQueueItem[] = [];
  let processed = 0;
  let failed = 0;

  for (const item of queue) {
    let success = false;

    try {
      if (sendFunction) {
        success = await sendFunction(item);
      } else {
        // Simulación predeterminada de envío al endpoint
        const response = await fetch(item.endpoint, {
          method: item.action === 'CREATE' ? 'POST' : item.action === 'DELETE' ? 'DELETE' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });
        success = response.ok;
      }
    } catch (error) {
      console.warn(`Fallo al sincronizar ítem ${item.id}:`, error);
      success = false;
    }

    if (success) {
      processed++;
    } else {
      const updatedRetries = item.retries + 1;
      if (updatedRetries < MAX_RETRIES) {
        remainingQueue.push({ ...item, retries: updatedRetries });
      } else {
        console.error(`Ítem ${item.id} descartado tras exceder el máximo de ${MAX_RETRIES} reintentos.`);
        failed++;
      }
    }
  }

  saveSyncQueue(remainingQueue);
  return { processed, failed };
}

/**
 * Limpia la cola por completo.
 */
export function clearSyncQueue(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(QUEUE_STORAGE_KEY);
}
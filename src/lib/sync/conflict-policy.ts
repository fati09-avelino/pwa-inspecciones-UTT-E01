import { InspectionItem } from '../storage/schema';

/**
 * Resuelve conflictos entre la versión local y la versión del servidor.
 * Aplica la estrategia Last-Write-Wins (gana la modificación más reciente).
 */
export function resolveConflict(
  localVersion: InspectionItem,
  serverVersion: InspectionItem
): InspectionItem {
  const localTime = new Date(localVersion.updatedAt).getTime();
  const serverTime = new Date(serverVersion.updatedAt).getTime();

  // Si la versión local es estrictamente más nueva que la del servidor
  if (localTime > serverTime) {
    return {
      ...localVersion,
      version: serverVersion.version + 1
    };
  }

  // De lo contrario, prevalece la versión del servidor
  return serverVersion;
}

/**
 * Verifica si un elemento ya existe en la cola de sincronización para evitar duplicados.
 */
export function isDuplicateInQueue(queue: InspectionItem[], newItem: InspectionItem): boolean {
  return queue.some((item) => item.id === newItem.id);
}

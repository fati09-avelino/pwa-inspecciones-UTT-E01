import { validateInspection } from '../data/inspections';
import type { InspectionItem } from './schema';
import { addToSyncQueue, getSyncQueue, processSyncQueue } from '../sync/queue';

export interface SavedInspection extends InspectionItem {
  laboratory: string;
  syncState: 'pending' | 'synced';
}
const KEY = 'utt_pwa_inspections';
export function readLocalInspections(): SavedInspection[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error('El almacenamiento local no es válido.');
  return value as SavedInspection[];
}
export function saveLocalInspection(item: SavedInspection): void {
  if (!validateInspection(item) || !item.summary.trim()) throw new Error('Completa laboratorio y resumen.');
  const previous = readLocalInspections();
  if (previous.some(saved => saved.id === item.id)) throw new Error('Esta inspección ya está guardada.');
  localStorage.setItem(KEY, JSON.stringify([...previous, item]));
  try {
    addToSyncQueue(item, 'CREATE');
  } catch (error) {
    localStorage.setItem(KEY, JSON.stringify(previous));
    throw error;
  }
}
let activeSync: Promise<void> | undefined;
export function synchronizeLocalInspections(): Promise<void> {
  if (activeSync) return activeSync;
  activeSync = (async () => {
    const confirmed = new Set<string>();
    await processSyncQueue(async operation => {
      const response = await fetch(operation.endpoint, {
        method: operation.action === 'CREATE' ? 'POST' : operation.action === 'DELETE' ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': operation.id },
        body: JSON.stringify(operation.payload),
      });
      if (response.ok) confirmed.add(operation.payload.id);
      return response.ok;
    });
    const pending = new Set(getSyncQueue().map(operation => operation.payload.id));
    localStorage.setItem(KEY, JSON.stringify(readLocalInspections().map(item =>
      confirmed.has(item.id) && !pending.has(item.id) ? { ...item, syncState: 'synced' } : item)));
  })().finally(() => { activeSync = undefined; });
  return activeSync;
}

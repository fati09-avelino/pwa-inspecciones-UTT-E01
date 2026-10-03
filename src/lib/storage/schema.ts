export interface InspectionItem {
  id: string;
  title: string;
  status: 'Pendiente' | 'En revisión' | 'Completada';
  statusLabel: string;
  location: string;
  summary: string;
  findings: string;
  inspectorNotes?: string;
  updatedAt: string; // Fecha en formato ISO para control de versiones
  version: number;   // Número de versión para detectar conflictos
}

export interface SyncQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  payload: InspectionItem;
  timestamp: number;
  retries: number;
}

export interface ConflictResolutionResult {
  resolvedData: InspectionItem;
  hasConflict: boolean;
  strategyUsed: 'server-wins' | 'client-wins' | 'last-write-wins';
}

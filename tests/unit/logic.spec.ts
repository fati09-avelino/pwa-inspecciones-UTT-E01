import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// =====================================================================
// 1. SETUP: Mock de localStorage para el entorno de Node.js
// =====================================================================
let store: Record<string, string> = {};
(global as any).window = {}; 
(global as any).localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = String(value); },
  removeItem: (key: string) => { delete store[key]; }
};

// =====================================================================
// 2. IMPORTACIONES REALES DEL PROYECTO
// =====================================================================
import { validateInspection } from '../../src/lib/data/inspections';
import { addToSyncQueue, getSyncQueue } from '../../src/lib/sync/queue';

// =====================================================================
// 3. PRUEBAS UNITARIAS
// =====================================================================
describe('Pruebas Unitarias: Flujo Crítico de Inspecciones', () => {

  describe('Regla de Validación de Inspección (src/lib/data/inspections.ts)', () => {
    it('debe aprobar una inspección con entradas válidas', () => {
      const validData = { id: 'INS-100', laboratory: 'Laboratorio de Redes' };
      assert.equal(validateInspection(validData), true);
    });

    it('debe rechazar una inspección con entradas inválidas (vacías)', () => {
      const invalidData = { id: '', laboratory: '' };
      assert.equal(validateInspection(invalidData), false);
    });
  });

  describe('Regla de Idempotencia en la Cola de Sincronización (src/lib/sync/queue.ts)', () => {
    
    beforeEach(() => {
      store = {}; // Limpiamos la memoria antes de cada prueba
    });

    it('debe agregar un registro nuevo si la cola está vacía', () => {
      const newPayload: any = { id: 'SYNC-001', summary: 'Datos nuevos' };
      addToSyncQueue(newPayload, 'CREATE');
      
      const currentQueue = getSyncQueue();
      assert.equal(currentQueue.length, 1);
      assert.equal(currentQueue[0].payload.id, 'SYNC-001');
    });

    it('NO debe duplicar el registro si el mismo ID ya existe en la cola (Idempotencia)', () => {
      const payload: any = { id: 'SYNC-001', summary: 'Datos' };
      
      // Simulamos que el usuario presiona el botón "Guardar" dos veces rápido
      addToSyncQueue(payload, 'CREATE');
      addToSyncQueue(payload, 'CREATE');
      
      const currentQueue = getSyncQueue();
      assert.equal(currentQueue.length, 1); // La cola evita el duplicado
    });
  });
});

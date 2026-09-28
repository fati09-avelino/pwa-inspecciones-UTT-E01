import { inspections, type Inspection } from '@/lib/data/inspections';

// Latencia simulada (ms) para imitar una consulta a una API real con datos
// sintéticos. Permite ver los estados de carga y probarlos de forma
// determinista (las pruebas pasan latencyMs = 0).
const DEFAULT_LATENCY_MS = 250;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchInspections(latencyMs: number = DEFAULT_LATENCY_MS): Promise<Inspection[]> {
  await wait(latencyMs);
  return inspections;
}

export async function fetchInspectionById(
  id: string,
  latencyMs: number = DEFAULT_LATENCY_MS
): Promise<Inspection | undefined> {
  await wait(latencyMs);
  return inspections.find((item) => item.id === id);
}

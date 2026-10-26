import { NextResponse } from 'next/server';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { validateInspection } from '../../../lib/data/inspections';
import type { InspectionItem } from '../../../lib/storage/schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type RecordItem = InspectionItem & { laboratory: string };
interface Store { records: Record<string, RecordItem>; operations: Record<string, string> }
const file = resolve(process.env.PWA_SYNTHETIC_STORE || '.pwa-data/inspections.json');
let transaction: Promise<unknown> = Promise.resolve();
async function load(): Promise<Store> {
  try { return JSON.parse(await readFile(file, 'utf8')) as Store; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { records: {}, operations: {} };
    throw error;
  }
}
export async function GET() {
  await transaction;
  const store = await load();
  return NextResponse.json({ inspections: Object.values(store.records) }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > 32768) return NextResponse.json({ error: 'Datos demasiado grandes' }, { status: 413 });
    const data = JSON.parse(text) as Record<string, unknown>;
    if (!data || typeof data !== 'object' ||
        typeof data.id !== 'string' || !/^SYNTH-[a-zA-Z0-9-]{1,100}$/.test(data.id) ||
        typeof data.laboratory !== 'string' || typeof data.summary !== 'string' ||
        !validateInspection(data) || !data.summary.trim() || data.summary.length > 1000 ||
        data.laboratory.length > 120) {
      return NextResponse.json({ error: 'Solo se admiten inspecciones sintéticas válidas' }, { status: 400 });
    }
    const key = request.headers.get('Idempotency-Key');
    if (!key || key.length > 200) return NextResponse.json({ error: 'Falta identidad de operación' }, { status: 400 });
    const id = data.id;
    const item: RecordItem = {
      id, laboratory: data.laboratory.trim(), title: data.laboratory.trim(),
      summary: data.summary.trim(), location: 'Laboratorio sintético', status: 'Pendiente',
      statusLabel: 'Pendiente', findings: 'Registro sintético de pruebas',
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(), version: 1,
    };
    const fingerprint = JSON.stringify(item);
    const result = transaction.then(async () => {
      const store = await load();
      if (store.operations[key] && store.operations[key] !== fingerprint) {
        return NextResponse.json({ error: 'La operación ya tiene otro contenido' }, { status: 409 });
      }
      if (!store.operations[key]) {
        store.records[id] = item;
        store.operations[key] = fingerprint;
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file + '.tmp', JSON.stringify(store), 'utf8');
        await rename(file + '.tmp', file);
      }
      return NextResponse.json({ inspection: store.records[id] });
    });
    transaction = result.catch(() => undefined);
    return await result;
  } catch (error) {
    return NextResponse.json({ error: error instanceof SyntaxError ? 'JSON inválido' : 'No se pudo persistir' },
      { status: error instanceof SyntaxError ? 400 : 500 });
  }
}

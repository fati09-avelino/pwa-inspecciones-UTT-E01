'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import DeviceActions from './device-actions';
import { readLocalInspections, saveLocalInspection, synchronizeLocalInspections, type SavedInspection } from '../lib/storage/local-inspections';

export default function InspectionCapture() {
  const [items, setItems] = useState<SavedInspection[]>([]);
  const [laboratory, setLaboratory] = useState('');
  const [summary, setSummary] = useState('');
  const [online, setOnline] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const syncing = useRef(false);
  const refresh = useCallback(() => {
    try { setItems(readLocalInspections()); }
    catch { setError('No se pudo leer el almacenamiento. No se borró ningún dato.'); }
  }, []);
  const synchronize = useCallback(async () => {
    if (syncing.current || !navigator.onLine) return;
    syncing.current = true;
    setBusy(true);
    setError('');
    try {
      await synchronizeLocalInspections();
      refresh();
      setMessage('Sincronización finalizada. Las operaciones sin confirmar permanecen pendientes.');
    } catch {
      setError('No se pudo sincronizar. Conserva esta página y vuelve a intentarlo.');
    } finally { syncing.current = false; setBusy(false); }
  }, [refresh]);
  useEffect(() => {
    refresh();
    setOnline(navigator.onLine);
    const reconnect = () => { setOnline(true); void synchronize(); };
    const disconnect = () => setOnline(false);
    window.addEventListener('online', reconnect);
    window.addEventListener('offline', disconnect);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('online', reconnect);
      window.removeEventListener('offline', disconnect);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh, synchronize]);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      const now = new Date().toISOString();
      saveLocalInspection({
        id: 'SYNTH-' + crypto.randomUUID(), laboratory: laboratory.trim(),
        title: laboratory.trim(), summary: summary.trim(), status: 'Pendiente',
        statusLabel: 'Pendiente', location: 'Laboratorio sintético',
        findings: 'Registro sintético de pruebas', updatedAt: now, version: 1, syncState: 'pending',
      });
      refresh();
      setLaboratory('');
      setSummary('');
      setMessage('Inspección guardada en este dispositivo.');
    } catch {
      setError('No se pudo guardar. Completa los datos y comprueba el espacio del dispositivo.');
    }
  }

  return (
    <section aria-labelledby="capture-title" style={{ maxWidth: 896, margin: '1rem auto', padding: 24, border: '1px solid #ddd' }}>
      <h2 id="capture-title">Nueva inspección de prueba</h2>
      <p>Usa únicamente datos sintéticos. Cámara y ubicación son opcionales.</p>
      <p role="status">{online ? 'Con conexión' : 'Sin conexión'}</p>
      <form onSubmit={save}>
        <label>Laboratorio sintético <input required maxLength={120} value={laboratory} onChange={event => setLaboratory(event.target.value)} /></label>
        <label>Resumen de prueba <textarea required maxLength={1000} value={summary} onChange={event => setSummary(event.target.value)} /></label>
        <DeviceActions />
        <p>El archivo y la ubicación son apoyos de esta sesión; esta versión guarda solo los datos de texto de la inspección.</p>
        <button type="submit">Guardar inspección</button>
      </form>
      <button type="button" disabled={!online || busy} onClick={() => void synchronize()}>Sincronizar pendientes</button>
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
      <h3>Capturas guardadas en este dispositivo</h3>
      {items.map(item => (
        <article key={item.id} aria-label={'Inspección ' + item.id}>
          <h4>{item.laboratory}</h4><p>{item.summary}</p>
          <p>{item.syncState === 'synced' ? 'Sincronizada' : 'Pendiente de sincronizar'}</p>
          <small>{item.id}</small>
        </article>
      ))}
    </section>
  );
}

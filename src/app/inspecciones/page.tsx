'use client';

import { useEffect, useState } from 'react';
import InspectionsView, { type StatusFilter, type ViewState } from '@/components/inspections-view';
import { fetchInspections } from '@/lib/data/inspections-service';

// Ruta CSR: el servidor solo entrega el "cascarón" (estado de carga). Los
// datos se piden y se pintan en el navegador, con filtro interactivo.
export default function InspeccionesPage() {
  const [state, setState] = useState<ViewState>({ kind: 'loading' });
  const [filter, setFilter] = useState<StatusFilter>('todas');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });
    fetchInspections()
      .then((items) => {
        if (!cancelled) setState({ kind: 'ready', items });
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            kind: 'error',
            message: 'No se pudieron cargar las inspecciones. Verifica tu conexión e inténtalo de nuevo.'
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return (
    <InspectionsView
      state={state}
      filter={filter}
      onFilterChange={setFilter}
      onRetry={() => setAttempt((n) => n + 1)}
    />
  );
}

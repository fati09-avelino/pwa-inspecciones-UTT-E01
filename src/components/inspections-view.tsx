import Link from 'next/link';
import type { Inspection } from '@/lib/data/inspections';
import LoadingState from '@/components/loading-state';

export type StatusFilter = 'todas' | Inspection['status'];

export const STATUS_FILTERS: StatusFilter[] = ['todas', 'Pendiente', 'En revisión', 'Completada'];

export type ViewState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; items: Inspection[] };

export function filterInspections(items: Inspection[], filter: StatusFilter): Inspection[] {
  return filter === 'todas' ? items : items.filter((item) => item.status === filter);
}

type InspectionsViewProps = {
  state: ViewState;
  filter: StatusFilter;
  onFilterChange?: (filter: StatusFilter) => void;
  onRetry?: () => void;
};

// Vista del listado: función pura de sus props (sin hooks), por lo que se
// puede renderizar y probar en cada estado (carga, error, vacío, con datos).
export default function InspectionsView({ state, filter, onFilterChange, onRetry }: InspectionsViewProps) {
  const visible = state.kind === 'ready' ? filterInspections(state.items, filter) : [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Listado de Inspecciones (CSR)</h1>

      <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={filter === option}
            onClick={() => onFilterChange?.(option)}
            className={`px-3 py-1 text-sm rounded-full border ${
              filter === option ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'
            }`}
          >
            {option === 'todas' ? 'Todas' : option}
          </button>
        ))}
      </div>

      {state.kind === 'loading' && <LoadingState />}

      {state.kind === 'error' && (
        <div role="alert" className="p-6 text-center bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error de carga</h2>
          <p className="text-gray-600 mb-4">{state.message}</p>
          <button
            type="button"
            onClick={() => onRetry?.()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {state.kind === 'ready' && visible.length === 0 && (
        <p className="p-6 text-center text-gray-600 border border-dashed rounded-lg">
          No hay inspecciones para mostrar.
        </p>
      )}

      {state.kind === 'ready' && visible.length > 0 && (
        <div className="grid gap-4">
          {visible.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-blue-600">{item.id}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'Completada'
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'Pendiente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.statusLabel}
                </span>
              </div>
              <h2 className="text-lg font-medium text-gray-900">{item.laboratory}</h2>
              <p className="text-sm text-gray-600 mt-1">{item.summary}</p>
              <div className="mt-4 flex justify-end">
                <Link
                  href={`/inspecciones/${item.id}`}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                >
                  Ver Detalle
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

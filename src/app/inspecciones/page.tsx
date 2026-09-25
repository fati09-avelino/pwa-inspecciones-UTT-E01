import Link from 'next/link';
import { inspections } from '@/lib/data/inspections';

export default async function InspeccionesPage() {
  const data = inspections;

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-bold">Error de carga</h2>
        <p>No se encontraron registros de inspecciones disponibles.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Listado de Inspecciones (SSR)</h1>
      <div className="grid gap-4">
        {data.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-blue-600">{item.id}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.status === 'Completada' ? 'bg-green-100 text-green-800' :
                item.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {item.statusLabel}
              </span>
            </div>
            <h2 className="text-lg font-medium text-gray-900">{item.laboratory}</h2>
            <p className="text-sm text-gray-600 mt-1">{item.summary}</p>
            <div className="mt-4 flex justify-end">
              <Link href={`/inspecciones/${item.id}`} className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">
                Ver Detalle
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

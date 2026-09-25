import Link from 'next/link';
import { inspections } from '@/lib/data/inspections';

interface PageProps {
  params: {
    id: string;
  };
}

export default function InspeccionDetallePage({ params }: PageProps) {
  const inspection = inspections.find((item) => item.id === params.id);

  if (!inspection) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <h2 className="text-xl font-bold text-red-700 mb-2">Inspección no encontrada</h2>
        <p className="text-gray-600 mb-4">El identificador {params.id} no existe en los registros sintéticos.</p>
        <Link href="/inspecciones" className="text-blue-600 underline font-medium">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{inspection.id}</h1>
        <span className={`px-3 py-1 text-sm rounded-full ${
          inspection.status === 'Completada' ? 'bg-green-100 text-green-800' :
          inspection.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {inspection.statusLabel}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Laboratorio</h2>
          <p className="text-lg text-gray-900 font-medium">{inspection.laboratory}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Ubicación</h2>
          <p className="text-gray-800">{inspection.location}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Resumen</h2>
          <p className="text-gray-800">{inspection.summary}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Hallazgos</h2>
          <p className="text-gray-800 bg-gray-50 p-3 rounded border">{inspection.findings}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Notas del Inspector ({inspection.inspector})</h2>
          <p className="text-gray-700 italic">{inspection.notes}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Fecha de Registro</h2>
          <p className="text-gray-600">{inspection.date}</p>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t flex justify-between">
        <Link href="/inspecciones" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">
          ← Volver al listado
        </Link>
      </div>
    </div>
  );
}

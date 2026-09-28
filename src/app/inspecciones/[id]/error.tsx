'use client';

// Error boundary de la ruta de detalle: se muestra si el Server Component
// lanza una excepción inesperada.
export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="max-w-md mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
      <h2 className="text-xl font-bold text-red-700 mb-2">No se pudo cargar la inspección</h2>
      <p className="text-gray-600 mb-4">Ocurrió un problema inesperado. Inténtalo de nuevo.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        Reintentar
      </button>
    </div>
  );
}

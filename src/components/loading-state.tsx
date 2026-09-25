export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 font-semibold">Cargando información de inspecciones...</p>
    </div>
  );
}

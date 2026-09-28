import LoadingState from '@/components/loading-state';

// Next.js muestra este archivo automáticamente mientras el Server Component
// del detalle espera sus datos (streaming).
export default function Loading() {
  return <LoadingState />;
}

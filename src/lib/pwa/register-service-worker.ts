export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  const register = () => navigator.serviceWorker.register('/sw.js')
    .then(registration => { console.log('Service Worker registrado con éxito:', registration.scope); })
    .catch(error => { console.error('Falló el registro del Service Worker:', error); });
  if (typeof document !== 'undefined' && document.readyState === 'complete') {
    void register();
  } else {
    window.addEventListener('load', register, { once: true });
  }
}

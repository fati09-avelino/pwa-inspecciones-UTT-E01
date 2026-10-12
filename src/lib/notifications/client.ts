// src/lib/notifications/client.ts

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

/**
 * Verifica si las notificaciones web están soportadas en el navegador actual.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Solicita permisos mínimos para el envío de notificaciones.
 * Retorna el estado actual del permiso ('granted', 'denied', 'default').
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('Las notificaciones no están soportadas en este navegador.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.warn('Error al solicitar permiso de notificaciones:', error);
    return 'denied';
  }
}

/**
 * Tiempo máximo de espera para que el Service Worker esté listo.
 */const SW_READY_TIMEOUT_MS = 2000;

// Espera al Service Worker, pero sin quedarse colgado si no hay ninguno activo.
async function getActiveRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<null>((resolve) => {
      timer = setTimeout(() => resolve(null), SW_READY_TIMEOUT_MS);
    });
    return await Promise.race([navigator.serviceWorker.ready, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Muestra una notificación local al usuario.
 * Nunca pide permiso por su cuenta. Devuelve true si se mostró.
 */
export async function sendLocalNotification(payload: NotificationPayload): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.info('[FALLBACK NOTIFICACIÓN]:', payload.title, '-', payload.body);
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const options = {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        data: payload.data,
      };

      const registration = await getActiveRegistration();
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(payload.title, options);
        return true;
      }

      // Sin Service Worker activo: API Notification en el hilo principal
      new Notification(payload.title, options);
      return true;
    } catch (error) {
      console.warn('Fallo al emitir la notificación nativa:', error);
    }
  }

  // Fallback cuando el permiso no está concedido
  console.info('[NOTIFICACIÓN RETENIDA POR PERMISOS]:', payload.title, '-', payload.body);
  return false;
}
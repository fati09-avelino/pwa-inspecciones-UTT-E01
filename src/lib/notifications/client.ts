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
 * Muestra una notificación local al usuario.
 * Si las notificaciones nativas no están permitidas o no son soportadas,
 * ejecuta un fallback por consola/interfaz sin interrumpir la aplicación.
 */
export async function sendLocalNotification(payload: NotificationPayload): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.info('[FALLBACK NOTIFICACIÓN]:', payload.title, '-', payload.body);
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      // Intentar mostrar la notificación a través del Service Worker si está activo
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/icons/icon-192x192.png',
            data: payload.data,
          });
          return true;
        }
      }

      // Fallback a la API de Notification estándar en el hilo principal
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        data: payload.data,
      });
      return true;
    } catch (error) {
      console.warn('Fallo al emitir la notificación nativa:', error);
    }
  }

  // Fallback silencioso cuando el permiso no está concedido
  console.info('[NOTIFICACIÓN RETENIDA POR PERMISOS]:', payload.title, '-', payload.body);
  return false;
}
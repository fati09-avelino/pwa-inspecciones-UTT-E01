// src/lib/device/geolocation.ts

export interface GeoLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/**
 * Obtiene la ubicación actual del dispositivo usando permisos mínimos.
 * Retorna null como fallback silencioso si falla o se deniega el permiso,
 * evitando que la aplicación se rompa.
 */
export async function getCurrentLocation(): Promise<GeoLocationResult | null> {
  if (!('geolocation' in navigator)) {
    console.warn('Geolocalización no soportada por el navegador.');
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.warn('Error al obtener geolocalización (Fallback activado):', error.message);
        resolve(null); // Fallback: retorna null en lugar de lanzar una excepción
      },
      {
        enableHighAccuracy: false, // Permiso mínimo necesario para ahorrar batería
        timeout: 10000,            // Tiempo máximo de espera: 10 segundos
        maximumAge: 60000          // Acepta ubicaciones en caché de hasta 1 minuto
      }
    );
  });
}
// src/lib/device/camera.ts

/**
 * Solicita permiso mínimo para usar la cámara del dispositivo.
 * Inicia el stream e inmediatamente lo detiene para no consumir recursos,
 * retornando true si el usuario concedió el acceso.
 */
export async function requestCameraPermission(): Promise<boolean> {
  if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
    console.warn('La API de mediaDevices no está soportada en este navegador.');
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Detenemos los tracks inmediatamente ya que solo queríamos validar el permiso
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.warn('Permiso de cámara denegado o cámara no disponible:', error);
    return false;
  }
}

/**
 * FALLBACK: Si no hay acceso directo a la cámara vía API, 
 * devolvemos un input HTML nativo que permite tomar una foto o subir un archivo.
 */
export function getFallbackFileInput(): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment'; // Sugiere usar la cámara trasera en dispositivos móviles
  return input;
}
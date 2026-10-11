# Integración de Capacidades del Dispositivo y Notificaciones (Semana 06)

## 1. Arquitectura de Permisos Mínimos y Fallbacks

Para la PWA de Inspecciones de Laboratorio de la UTT, se integraron capacidades de hardware y avisos al usuario siguiendo el principio de **permisos mínimos** y **degradación progresiva (fallbacks)**.

---

## 2. Módulos de Hardware Implementados

### A. Acceso a Cámara (`src/lib/device/camera.ts`)
- **Permisos Mínimos:** Se solicita acceso a la API `mediaDevices.getUserMedia({ video: true })` únicamente para validar la disponibilidad y detener de inmediato el *stream*, liberando la cámara.
- **Mecanismo Fallback:** Si el navegador no soporta la API o el usuario deniega el permiso, la aplicación degrada hacia un elemento `<input type="file" accept="image/*" capture="environment">` para permitir la captura o selección de fotos desde el sistema de archivos nativo.

### B. Geolocalización (`src/lib/device/geolocation.ts`)
- **Permisos Mínimos:** Configuración con `enableHighAccuracy: false`, `timeout: 10000` y `maximumAge: 60000` para reducir el impacto en la batería y acelerar la respuesta mediante datos cacheados.
- **Mecanismo Fallback:** En caso de denegación o error de señal, retorna `null` de forma silenciosa, garantizando que el formulario de inspección continúe funcional.

---

## 3. Cliente de Notificaciones (`src/lib/notifications/client.ts`)

- **Verificación de Soporte:** Comprueba la existencia global del objeto `Notification` y `navigator.serviceWorker`.
- **Gestión de Permisos:** Solicita la autorización del usuario (`requestNotificationPermission()`) de forma explícita antes de intentar cualquier emisión.
- **Emisión con Prioridad Service Worker:**
  1. Si hay un Service Worker activo, utiliza `registration.showNotification()` para garantizar el despacho de avisos.
  2. Si el Service Worker no está listo, utiliza la Web Notification API del hilo principal.
  3. **Fallback Silencioso:** Si el permiso es denegado o no soportado, la notificación se procesa vía `console.info` en la interfaz sin interrumpir el flujo de trabajo de la inspección.

---

## 4. Matriz de Degradación Progresiva

| Capacidad | API Nativa | Condición de Fallo | Fallback Adoptado |
| :--- | :--- | :--- | :--- |
| **Cámara** | `navigator.mediaDevices.getUserMedia` | Denegado / Sin soporte | `<input type="file" accept="image/*" capture="environment">` |
| **Ubicación** | `navigator.geolocation.getCurrentPosition` | Denegado / Timeout | Retorno de `null` controlado (continuación manual) |
| **Notificaciones** | `Notification.requestPermission` / SW | Denegado / Sin soporte | Alerta por consola / interfaz de usuario |
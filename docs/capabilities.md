# Capacidades del dispositivo y notificaciones (Semana 06)

Todas las capacidades son **opcionales**: la app funciona completa sin ellas. Se usan solo datos sintéticos.

## 1. Principios

- **Permiso mínimo:** se pide lo estrictamente necesario y solo cuando la persona toca un botón. Importar los módulos o cargar la página no pide ningún permiso.
- **Fallback siempre:** si la API no existe o el permiso se deniega, nada lanza error y la persona ve un mensaje en pantalla con una alternativa.
- **Datos mínimos:** no se guarda ni se recolecta más de lo necesario.

## 2. Dónde las usa la interfaz

Componente `src/components/device-actions.tsx`, mostrado en `/inspecciones`:

| Botón | Qué hace | Cuándo se pide el permiso |
| :--- | :--- | :--- |
| 📷 Adjuntar Foto | Comprueba la cámara y abre el selector de imagen | Al tocar el botón |
| 📍 Registrar Ubicación | Obtiene latitud, longitud y precisión | Al tocar el botón |
| 🔔 Activar Avisos | Pide permiso de notificaciones | Al tocar el botón |
| 🔄 Simular Cambio de Estado | Emite un aviso de "inspección actualizada" | Nunca: no pide permiso, usa el estado actual |

Al cargar, el componente solo **lee** `Notification.permission` para mostrar el estado ("Avisos activados / sin activar / bloqueados / no soportados").

## 3. Módulos

### Cámara (`src/lib/device/camera.ts`)
- **Permiso mínimo:** `getUserMedia({ video: true })`, sin micrófono. Las pistas se apagan de inmediato.
- **Fallback:** si no hay cámara o se deniega, la interfaz muestra un mensaje y abre un `<input type="file" accept="image/*" capture="environment">` para elegir o tomar la foto.
- **Decisión:** en móvil, `capture` ya abre la cámara por sí solo. Se conserva la comprobación previa con `getUserMedia` para poder detectar la denegación y avisar. A cambio, algunos navegadores pueden mostrar dos pasos (permiso y selector).

### Geolocalización (`src/lib/device/geolocation.ts`)
- **Permiso mínimo:** baja precisión (`enableHighAccuracy: false`) y espera máxima de 10 s para ahorrar batería. Devuelve solo `latitude`, `longitude` y `accuracy`.
- **Fallback:** si no hay soporte, se deniega o expira, devuelve `null` y la interfaz indica que se puede continuar sin ubicación.

### Notificaciones (`src/lib/notifications/client.ts`)
- `isNotificationSupported()` comprueba que exista `window.Notification`.
- `requestNotificationPermission()` devuelve `'granted'`, `'denied'` o `'default'`; sin soporte o ante un error devuelve `'denied'`.
- `sendLocalNotification()` **no pide permiso por su cuenta**. Con permiso concedido espera como máximo 2 segundos a que haya un Service Worker activo y usa `showNotification`; si no aparece, usa `Notification` en el hilo principal. Devuelve `true` si se mostró.
- **Fallback:** si devuelve `false` (sin soporte, permiso denegado o sin decidir), la interfaz muestra el aviso como mensaje dentro de la app. En consola solo queda un registro informativo.

## 4. Matriz de degradación

| Capacidad | Condición de fallo | Fallback que ve la persona |
| :--- | :--- | :--- |
| Cámara | Sin API / permiso denegado | Mensaje + selector de archivo de imagen |
| Ubicación | Sin API / denegado / tiempo agotado | Mensaje; el flujo continúa sin ubicación |
| Notificaciones | Sin soporte / denegado / sin decidir | Aviso mostrado dentro de la app |

## 5. Supuestos

- La app corre en un contexto seguro (HTTPS o `localhost`).
- Los avisos son **locales** (generados en el dispositivo). No hay servidor de notificaciones.

## 6. Límites

- No hay notificaciones push remotas: requerirían claves VAPID y un backend.
- La espera de 2 s al Service Worker es un valor fijo elegido por criterio, no medido, y no tiene una prueba automática propia (las 26 pruebas simulan el Service Worker). Se verificó a mano en `npm run dev`.
- `camera.ts` y `geolocation.ts` asumen que `navigator` existe, por lo que deben llamarse desde el navegador (por ejemplo, al hacer clic).
- Las pruebas automáticas usan APIs simuladas en Node. No se probó en dispositivos físicos ni con los permisos reales del sistema.

## 7. Fallos encontrados

- **Funciones sin interfaz:** los módulos existían, pero no había botones que los usaran, así que no se podía demostrar la captura de evidencia ni el aviso. Se corrigió con `device-actions.tsx`.
- **Fallback poco visible:** el fallback de notificaciones solo escribía en consola. Ahora la interfaz muestra el aviso en pantalla.
- **Espera infinita en "Simular Cambio de Estado":** al probar en `npm run dev` con el permiso concedido, el botón no hacía nada. `sendLocalNotification` esperaba `navigator.serviceWorker.ready` sin límite y, sin Service Worker activo, esa espera nunca terminaba. Se corrigió con un tiempo máximo de 2 s y, después, el uso de `Notification` directamente (commit `99ff82b`). Las pruebas automáticas no lo detectaron porque simulan el Service Worker: se vio solo probando en pantalla.
- **Errores con `alert()`:** el fallo de ubicación usaba `alert()`; se reemplazó por un mensaje accesible en la página.
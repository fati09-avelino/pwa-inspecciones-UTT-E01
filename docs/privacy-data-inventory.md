# Inventario de datos y privacidad (Semana 9)

Proyecto: PWA de inspecciones y mantenimiento de laboratorios (UTT, Grupo 10 A, Equipo 1).
**Todo el uso académico es con datos sintéticos.** Este documento describe lo que la aplicación hace hoy, no lo que debería hacer. Lo que no existe se declara como pendiente.

Se contrastó con `src/components/inspection-capture.tsx`, `src/app/api/inspecciones/route.ts` y `public/sw.js` de la rama `develop`.

## 1. Inventario de datos

| Dato | Origen | Dónde se guarda | ¿Sale del dispositivo? | Finalidad |
| :--- | :--- | :--- | :--- | :--- |
| Laboratorio (texto libre, máx. 120 caracteres) | Formulario de captura | `LocalStorage` y cola de sincronización | Sí: al sincronizar se envía a la API | Identificar la inspección |
| Resumen (texto libre, máx. 1000 caracteres) | Formulario de captura | `LocalStorage` y cola de sincronización | Sí: se envía a la API | Describir la inspección |
| Identificador (`SYNTH-` + UUID aleatorio) y fecha de actualización | Generados por la app | `LocalStorage`, cola y API | Sí | Identificar y ordenar el registro |
| Clave de operación (`Idempotency-Key`) | Generada por la app | Cabecera de la petición; la API la guarda junto con una copia del registro | Sí | Evitar duplicados al reintentar |
| Estado, ubicación textual y hallazgos | Valores fijos del código (`Pendiente`, `Laboratorio sintético`, `Registro sintético de pruebas`) | `LocalStorage` y API | Sí | Completar el modelo de datos. No los escribe la persona |
| Foto de evidencia | Cámara o selector de archivos | Solo en la sesión (memoria de la página) | **No.** La pantalla lo declara: "esta versión guarda solo los datos de texto" | Mostrar que la evidencia está lista |
| Nombre del archivo de la foto | Selector de archivos | Solo en la sesión | No | Se muestra en pantalla |
| Coordenadas (latitud, longitud, precisión) | Geolocalización del navegador | Solo en la sesión | **No** | Se muestran en pantalla |
| Estado de los permisos | Navegador | Lo gestiona el navegador | No | Saber si se puede usar la capacidad |
| Páginas y recursos de la app | Servidor de la app | Caché del Service Worker | No | Funcionar sin conexión |

**Almacenamiento en el servidor:** la API escribe un archivo JSON (`.pwa-data/inspections.json`, o la ruta de la variable `PWA_SYNTHETIC_STORE`) con dos secciones: los registros y las operaciones. La sección de operaciones guarda, por cada clave, una copia completa del contenido del registro, así que el texto queda **dos veces** en el archivo.

**Caché del Service Worker:** solo guarda peticiones GET del mismo origen. Excluye las rutas que empiezan con `/api/` y las peticiones de datos de React Server Components, por lo que las respuestas de la API no se cachean.

## 2. Datos personales y riesgos

- **No se piden nombres de personas, cuentas ni datos de contacto.** Pero `laboratorio` y `resumen` son texto libre: si alguien escribe datos personales, se guardan en `LocalStorage` y se envían a la API. La mitigación actual es la validación de la API (tipo, longitud y que el identificador empiece con `SYNTH-`) y que solo se usan datos sintéticos. La validación no detecta datos personales dentro del texto.
- **La API permite leer todos los registros sin autenticación.** `GET /api/inspecciones` devuelve todas las inspecciones guardadas a cualquiera que conozca la URL. Es el riesgo de privacidad más importante de la versión actual; hoy es aceptable solo porque los datos son sintéticos.
- **El sanitizador de `src/lib/security/index.ts` no se usa ni en el formulario ni en la API** (esos archivos no lo importan). Hoy la protección contra XSS depende de que React escapa el texto al mostrarlo. No se afirma que el sanitizador esté aplicado a la captura.
- **El nombre del archivo de la foto puede contener información personal** (un nombre, una fecha). Hoy solo se muestra en pantalla. Para las pruebas se deben usar imágenes con nombre neutro.
- **Las fotos pueden traer metadatos** (fecha, dispositivo, a veces ubicación). Como la foto no se guarda ni se envía, no salen del dispositivo; si algún día se envía, habrá que eliminarlos.
- **Las coordenadas son datos sensibles.** Se piden solo al tocar "Registrar Ubicación", con baja precisión, y se pierden al recargar la página.
- **`LocalStorage` no está cifrado** y lo puede leer cualquier script del mismo origen; por eso importa no cargar scripts de terceros.
- **El archivo JSON del servidor no debe subirse a Git.** Se comprueba que `.pwa-data/` esté en `.gitignore`.

## 3. Permisos (mínimo necesario)

| Capacidad | Cuándo se solicita | Qué se pide | Si se deniega |
| :--- | :--- | :--- | :--- |
| Cámara | Al tocar "Adjuntar Foto" | Solo video (sin micrófono); las pistas se apagan de inmediato | Aviso en pantalla y selector de archivos |
| Ubicación | Al tocar "Registrar Ubicación" | Baja precisión, espera máxima de 10 s; solo latitud, longitud y precisión | Aviso en pantalla; se puede continuar sin ella |
| Notificaciones | Al tocar "Activar Avisos" | Permiso de notificaciones locales | El aviso se muestra dentro de la app |

Ningún permiso se solicita al cargar la página.

## 4. Control de rastreo (`public/robots.txt`)

`public/robots.txt` pide a los buscadores que no rastreen `/api/` ni `/inspecciones`. **Esto no es un control de acceso:** es una petición voluntaria, la lee cualquiera y los rastreadores que no la respetan la ignoran. Tampoco sustituye a la autenticación: las páginas y `GET /api/inspecciones` siguen siendo accesibles para quien conozca la URL. Además, al ser público, enumera las rutas que se quiere ocultar.

## 5. Pendiente (no implementado)

- **Autenticación y autorización:** no existen.
- **Borrado automático y plazo de retención:** no hay. Los registros de `LocalStorage` y del archivo JSON permanecen hasta que alguien los borre. La pantalla muestra las capturas guardadas pero no ofrece borrarlas.
- **Cifrado de los datos locales:** no existe.
- **Limpieza de las operaciones guardadas por la API:** la sección de operaciones solo crece.
- **Detección de datos personales en el texto libre:** no existe.
- **Consentimiento y aviso de privacidad para usuarios reales:** no hay; no se justifican mientras todo sea sintético.

## 6. Supuestos y límites

- Todo el uso es académico y con datos sintéticos; si se usaran datos reales, este inventario y los controles tendrían que rehacerse antes.
- No se vio el código de `src/lib/storage/local-inspections.ts`; que los datos estén en `LocalStorage` y en la cola se tomó de la descripción del equipo.
- Este inventario no es una auditoría formal ni se contrastó con ninguna norma de privacidad.
- No se midió qué escriben las personas en los campos de texto libre.
- La API guarda en un archivo JSON, pensado solo para el curso; no es un almacenamiento de producción.

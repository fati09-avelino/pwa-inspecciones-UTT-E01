# Evidencia individual del equipo

> Un solo archivo compartido. Repitan la sección siguiente por cada integrante; cada persona escribe y explica su propia evidencia. Se aceptan evidencias previas equivalentes. El SHA final se entrega en Classroom después del último commit, para evitar modificar el commit que se está identificando.

- Grupo y equipo: 10 A, 1
- Repositorio del equipo: https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01.git


## Integrante 1: Fatima Avelino Celis
* **Contribución:** Configuración inicial del repositorio privado, instalación de dependencias, ejecución de inspecciones locales, redacción de `requirements.md` y `decision-record.md`, y estructuración del proyecto.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/2ab89bc0ff9cb0ab52c6c1a6d12d51885f454c4b
* **Decisión explicada:** Se decidió utilizar datos sintéticos sobre laboratorios de la UTT para evitar manejar datos reales de inventario y cumplir con los lineamientos de privacidad de la práctica.
* **Comando/Prueba ejecutada:** `npm run verify`
* **Resultado real:** pass. El reporte `reports/verification.json` se generó exitosamente.
* **Qué comprueba y qué no:** Comprueba que el proyecto compila, que los archivos requeridos existen y que las pruebas sintéticas pasan. No comprueba si el análisis documental es profundo o si los datos ficticios tienen sentido semántico.
* **Limitación:** El comando no revisa si las invitaciones de GitHub a los colaboradores ya fueron aceptadas.
* **Uso de IA:** Usé Gemini/ChatGPT como guía para estructurar y redactar los escenarios en requirements.md y la tabla en decision-record.md, realizando una revisión humana para confirmar que cumple con los criterios de la rúbrica AC-02.


## Integrante 2: Janeth Cabrera Arguelles
* **Contribución:** Configuración base del entorno para la Semana 02 (Fase 1), actualización e integración del script de verificación pública (`public-tests/check.sh`), estandarización del `README.md` de la raíz con instrucciones de setup/ejecución/pruebas, actualización de los workflows de GitHub Actions y verificación de compilación limpia.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/61bb613
* **Decisión explicada:** Se actualizó el script `public-tests/check.sh` sustituyendo las reglas de la Semana 1 por la suite de comprobaciones de la Semana 2 (existencia de `manifest.webmanifest`, `app-shell.tsx`, `layout.tsx`, `page.tsx`, `manifest.spec.ts`, `README.md` y escaneo de secretos). Esto garantiza que el contrato mínimo de evaluación pública se valide de forma determinista antes de cada entrega.
* **Comando/Prueba ejecutada:** `npm ci`, `npm run build` y `bash public-tests/check.sh`
* **Resultado real:** pass. El proyecto compiló exitosamente (`✓ Compiled successfully`) y el script arrojó `PUBLIC_OK` tras la integración completa de los componentes del equipo.
* **Qué comprueba y qué no:** Comprueba que la instalación de dependencias sea limpia e inmutable, que Next.js compile las páginas estáticas sin errores de sintaxis/tipado y que la estructura física de los artefactos obligatorios exista. No comprueba el diseño visual, accesibilidad CSS ni el comportamiento de los Service Workers.
* **Limitación:** El primer pipeline en GitHub Actions reflejó un fallo esperado en el criterio AC-02 (falta de componentes) antes de que el equipo integrara las Fases 2 y 3; la validación completa dependía de los commits subsecuentes.
* **Uso de IA:** Usé Gemini como asistencia para el diagnóstico de errores de entorno, validación de sintaxis en scripts Bash para Windows/Linux y estructuración del `README.md`. Realicé la validación humana probando manualmente la instalación limpia, la ejecución de scripts en terminal local y la verificación en GitHub.


## Integrante 3: Hector Ulises Cacho Gonzalez
* **Contribución:** Implementación del App Shell (src/components/app-shell.tsx) con navegación accesible y landmarks (header, nav, main, footer), enlace de salto al contenido ("skip link"), y actualización de src/app/layout.tsx (metadatos, viewport, referencia al manifest) y src/app/page.tsx (estados obligatorios de carga, error y vacío para las inspecciones, con controles de demostración).
* **Enlace a aportación:** ID DE MI SHA:
c52bede963c39512da610b272a1c0a1acae830d5
* **Decisión explicada:** Implementé los tres estados obligatorios (carga, error, vacío) como un cambio de estado local en page.tsx, controlado por botones de demostración, en lugar de simularlos con temporizadores automáticos. Esto permite que cualquier evaluador los revise e inspeccione en cualquier momento sin depender de tiempos de espera ni de una API real.
* **Comando/Prueba ejecutada:** `npm run build`
* **Resultado real:** compiló sin errores. Verifiqué también manualmente con teclado (tecla Tab) que el enlace "Saltar al contenido principal" y los botones de simulación de estado son accesibles sin usar el mouse.
* **Qué comprueba y qué no:** Comprueba que el App Shell, la navegación y los tres estados de interfaz existen y son funcionales/inspeccionables, y que el proyecto compila. No comprueba automáticamente el contraste de color ni el comportamiento ante una falla de red real (los estados de carga/error son simulados manualmente, no provienen de una petición fallida real).
* **Limitación:** Los estados de carga y error son representaciones visuales activadas manualmente; no reflejan aún una llamada de red real, ya que el manifiesto y las pruebas automatizadas todavía no estaban integrados en el momento de este commit.
* **Uso de IA:** Usé Claude (Anthropic) como apoyo para generar una primera versión de app-shell.tsx, page.tsx y los estilos asociados en globals.css, siguiendo la estructura y clases ya existentes del proyecto de la Semana 1. Revisé y probé el código localmente (npm run dev, npm run build, navegación por teclado) para confirmar que cumple los requisitos antes de integrarlo y puedo explicar cada decisión de implementación.


## SEMANA 2 

## Integrante 1: Fatima Avelino Celis
* **Contribución:** Configuración del archivo de manifiesto PWA (`public/manifest.webmanifest`), diseño, redimensionamiento y colocación de los iconos obligatorios (`192x192` y `512x512`) en la ruta `public/icons/`, en integración de los metadatos en `src/app/layout.tsx` de Next.js.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/eb40e73acc19ab130dd4537107fe2f5396c2c688
* **Decisión explicada:** Se decidió configurar el archivo de manifiesto con el modo de visualización `standalone` y colores corporativos acordes al sistema de inspecciones de la UTT, asegurando que el navegador reconozca la aplicación como instalable tanto en equipos de escritorio como en dispositivos móviles.
* **Comando/Prueba ejecutada:** `npm run test` y validación local en Chrome DevTools (Application > Manifest).
* **Resultado real:** pass. El manifiesto y los iconos fueron detectados correctamente sin errores de ruta (404) ni advertencias de dimensiones.
* **Qué comprueba y qué no:** Comprueba que la estructura sintáctica del archivo `manifest.webmanifest` es válida, que los iconos de 192x192 y 512x512 existen físicamente en las rutas correctas y que la PWA es elegible para instalación. No comprueba la lógica de almacenamiento en caché ni el funcionamiento sin conexión mediante Service Workers.
* **Limitación:** Las pruebas automáticas no validan la experiencia de usuario interactiva tras la instalación ni el comportamiento de red en entornos con conectividad intermitente real.
* **Uso de IA:** Usé Gemini como guía para verificar las propiedades requeridas en el manifiesto PWA de Next.js y los tamaños exactos de redimensionamiento de los iconos, realizando una revisión y validación manual directa en el navegador.

## SEMANA 3

## Integrante 1: Fatima Avelino Celis
* **Contribución:** Corrección de errores de tipado estricto en TypeScript dentro de `src/app/page.tsx`, actualización del modelo de datos en `src/lib/data/inspections.ts` (incorporando las propiedades requeridas `statusLabel`, `location`, `summary` y `findings`), y configuración robusta del Service Worker (`public/sw.js`) con manejo de excepciones en `cache.addAll` para garantizar la compilación de producción y el soporte sin conexión.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/847b0b006afc043b0371a0a1157071e7963d3c4f
* **Decisión explicada:** Se implementó un control de excepciones con `.catch()` durante la fase de instalación del Service Worker para prevenir que una falla en el precacheado de recursos secundarios detuviera la ejecución, logrando un build limpio en producción (`npm run build`) y un registro exitoso en el navegador.
* **Comando/Prueba ejecutada:** `npm run build`, `npm start` y validación manual del ciclo de vida del Service Worker (registro, estado *activated and is running* y prueba en modo *Offline*) en Chrome DevTools (Application > Service Workers).
* **Resultado real:** pass. El comando `npm run build` completó de forma exitosa sin errores de tipado (`Compiled successfully`), y el Service Worker se activó correctamente en el navegador sin registrar estados redundantes.
* **Qué comprueba y qué no:** Comprueba que la aplicación compila óptimamente para producción con TypeScript, que el modelo de datos coincide con la interfaz de usuario y que el Service Worker administra de manera resiliente la caché y las solicitudes offline. No comprueba la persistencia de datos en bases de datos remotas ni flujos de autenticación.
* **Limitación:** Las pruebas se ejecutaron en el entorno local (`localhost:3000`), por lo que no simulan la latencia de una red móvil real ni restricciones de almacenamiento en dispositivos físicos específicos.
* **Uso de IA:** Usé Gemini como guía técnica para identificar los errores de tipado en TypeScript, estructurar correctamente los datos de inspecciones y robustecer el código del ciclo de vida del Service Worker mediante manejo seguro de promesas.

## Integrante 2: Janeth Cabrera Arguelles
* **Contribución:** Redacción de la estrategia de caché y políticas de consistencia offline (`docs/cache-strategy.md`), actualización del `README.md` de la raíz con las instrucciones de setup/ejecución (`npm run dev`) y verificación para la Semana 03, y mantenimiento de los contratos de prueba pública.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/eb89aa7
* **Decisión explicada:** Se estructuró la estrategia de almacenamiento definiendo una política *Network First* para la navegación de páginas y *Cache First* / *Stale-While-Revalidate* para los recursos estáticos del App Shell. Esta decisión permite visualizar la versión más reciente del sistema cuando hay conectividad disponible, garantizando al mismo tiempo una respuesta fluida mediante respuestas de respaldo cuando el dispositivo se queda sin red.
* **Comando/Prueba ejecutada:** `npm ci`, `npm run dev`, `npm run build` y `bash public-tests/check.sh`
* **Resultado real:** pass. El proyecto realiza la instalación de dependencias de forma inmutable, compila estáticamente sin errores (`✓ Compiled successfully`) y el script de verificación valida la existencia de los artefactos obligatorios de la Semana 03 (AC-02).
* **Qué comprueba y qué no:** Comprueba que la documentación de arquitectura existe y concuerda con la implementación, que las instrucciones de ejecución y build son reproducibles y que el proyecto compila. No comprueba automáticamente el tiempo exacto de expiración del caché en disco ni la sincronización de fondo cuando se recupera la red.
* **Limitación:** Al ejecutar la prueba pública local en entornos Windows mediante Git Bash, el script reporta un aviso por el parámetro `pipefail` en la opción `set`, aunque en la canalización automatizada de GitHub Actions (Linux) ejecuta de forma nativa sin errores.
* **Uso de IA:** Usé Gemini como asistencia para estructurar la documentación de estrategias de caché siguiendo los patrones estándar de PWA y para la redacción de la evidencia técnica. Realicé la validación humana comprobando directamente la compilación local, revisando la nomenclatura de los archivos y verificando las instrucciones de desarrollo.

 ## Integrante 3: Hector Ulises Cacho Gonzalez
* **Contribución:** Implementación de las pruebas automatizadas de calidad para el Service Worker (`tests/service-worker.spec.ts` y `tests/offline.spec.ts`), cubriendo el ciclo de vida (`install`/`activate`), la estrategia de caché en `fetch` y el fallback offline, además de validar `src/lib/pwa/register-service-worker.ts` en entornos con y sin `window`.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/eb89aa7
* **Decisión explicada:** En lugar de verificar solo que los archivos existen o contienen cierto texto, monté un entorno simulado del `ServiceWorkerGlobalScope` (`self`, `caches`, `fetch`) usando el módulo `node:vm`, cargué el código real de `sw.js` dentro de ese entorno y disparé manualmente los eventos `install`, `activate` y `fetch`. Esta decisión permite que las pruebas verifiquen el comportamiento real del service worker (qué se cachea, qué se limpia, qué se sirve offline) en lugar de solo inspeccionar el código como texto, cumpliendo con el criterio de "pruebas de comportamiento" que pide la actividad.
* **Comando/Prueba ejecutada:** `npm run test` (incluido dentro de `npm run verify`)
* **Resultado real:** pass. Las 11 pruebas pasaron (2 heredadas de semanas anteriores + 5 de `service-worker.spec.ts` + 4 de `offline.spec.ts`), y `npm run build` compiló exitosamente (`✓ Compiled successfully`).
* **Qué comprueba y qué no:** Comprueba que el service worker precachea los recursos críticos del App Shell, limpia únicamente las cachés de versiones anteriores, sirve desde caché sin llamar a la red cuando el recurso ya existe, recurre a la red cuando no está cacheado, ignora peticiones que no son GET, y sirve un fallback offline ante un fallo de red durante la navegación; también comprueba que el registro del service worker no falla en un entorno de renderizado en servidor (sin `window`). No comprueba el comportamiento dentro de un navegador real ni métricas de rendimiento (Lighthouse), ya que las pruebas corren en un entorno Node simulado.
* **Limitación:** Las pruebas usan un entorno simulado en Node (`node:vm`), no un Service Worker real dentro de un navegador; una prueba end-to-end con Playwright daría mayor confianza pero no se implementó esta semana. Además, al ejecutarlas en Windows aparece un aviso (`MODULE_TYPELESS_PACKAGE_JSON`) por no declarar `"type": "module"` en `package.json`; es solo una advertencia de rendimiento, no un error, y se dejó así para no afectar el comportamiento de los scripts `.mjs` existentes.
* **Uso de IA:** Usé Claude (Anthropic) para diseñar el enfoque de simulación del Service Worker con `node:vm` y generar una primera versión de ambos archivos de prueba. Los ejecuté localmente, diagnostiqué y corregí un error real de rutas en Windows (el `import()` dinámico necesitaba una URL `file://`, no una ruta `C:\...`), y confirmé que las pruebas detectan una regresión real (verifiqué que fallan si se elimina `self.skipWaiting()` del service worker) antes de integrarlas al repositorio.

## Semana 4

## Integrante 1: Fatima Avelino Celis
* **Contribución:** Implementación de las rutas de listado (`src/app/inspecciones/page.tsx`) y detalle dinámico (`src/app/inspecciones/[id]/page.tsx`) utilizando renderizado del lado del servidor (SSR), junto con el componente de estado de carga (`src/components/loading-state.tsx`) para la PWA de inspecciones de laboratorios de la UTT.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/d4ab5319257db4669c377c690a6c3a50df673521
* **Decisión explicada:** Se implementó Server-Side Rendering (SSR) para las vistas de listado y detalle con datos sintéticos, asegurando que la información clave de los laboratorios y sus hallazgos se pre-rendericen en el servidor para optimizar la experiencia de usuario y la disponibilidad ante conectividad intermitente.
* **Comando/Prueba ejecutada:** `npm run build`, `npm run dev` y validación visual interactiva en el navegador local (`http://localhost:3000/inspecciones` y `http://localhost:3000/inspecciones/INS-003`).
* **Resultado real:** pass. El comando `npm run build` completó exitosamente sin errores de tipado en TypeScript (`Compiled successfully`), generando correctamente las rutas dinámicas y estáticas requeridas.
* **Qué comprueba y qué no:** Comprueba que la estructura de rutas en Next.js App Router procesa adecuadamente los datos sintéticos, renderiza los estados visuales y compila sin errores para producción. No comprueba la sincronización con bases de datos remotas ni APIs externas en tiempo real.
* **Limitación:** Las pruebas se ejecutaron exclusivamente en el entorno local (`localhost:3000`), por lo que no simulan latencias reales de red móvil ni restricciones de hardware en dispositivos físicos.
* **Uso de IA:** Usé Gemini como apoyo técnico para estructurar las rutas dinámicas en Next.js, validar el tipado de los datos sintéticos y redactar la documentación técnica de la actividad.

## Integrante 2: Janeth Cabrera Arguelles
* **Contribución:** Redacción del informe de decisiones de renderizado (`docs/rendering-decision.md`), actualización de la guía del proyecto (`README.md`) alineada a la arquitectura de Server Components de las rutas de inspección, y verificación de los contratos de pruebas automatizadas y soporte sin conexión.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/62db89869232d073e74b985eb6170c234f11a6bc
* **Decisión explicada:** Se justificó la adopción de Server-Side Rendering (SSR) mediante Server Components en Next.js para las rutas `/inspecciones` y `/inspecciones/[id]`, destacando que la generación del HTML en el servidor acelera el First Contentful Paint (FCP) y reduce el consumo de CPU en el cliente, complementándose con las políticas de fallback del Service Worker para garantizar la continuidad del usuario en entornos offline.
* **Comando/Prueba ejecutada:** `npm ci`, `npm run build`, `npm run test` y `bash public-tests/check.sh`
* **Resultado real:** pass. El proyecto instala dependencias de forma inmutable, pasa la suite de pruebas automatizadas offline (`tests/offline.spec.ts`), compila limpiamente para producción (`✓ Compiled successfully`) y el script valida los artefactos obligatorios.
* **Qué comprueba y qué no:** Comprueba que la documentación de arquitectura refleja fielmente la estructura de los Server Components implementados, que las pruebas unitarias del Service Worker pasan y que el proyecto compila. No comprueba automáticamente los tiempos exactos de latencia de red bajo conexiones móviles de alta variabilidad.
* **Limitación:** Al ejecutar la prueba pública local en entornos Windows mediante Git Bash, el script reporta un aviso por el parámetro `pipefail`, aunque en la canalización automatizada de GitHub Actions (Linux) ejecuta de manera nativa sin errores.
* **Uso de IA:** Usé Gemini como apoyo para estructurar el análisis de trade-offs de arquitectura SSR y la redacción del reporte de ingeniería. Realicé la validación humana inspeccionando directamente los Server Components del proyecto y ejecutando las pruebas de compilación y verificación en la terminal local.

> No necesitan inventar un error ni escribir pruebas nuevas. «Ejecuté npm test» es insuficiente como explicación: indiquen qué observa la prueba y qué comportamiento queda fuera.

## Integrante 3: Hector Ulises Cacho Gonzalez (Semana 4)
* **Contribución:** Escribí `tests/rendering.spec.ts` (14 pruebas de comportamiento) y extendí el loader de pruebas (`tests/ts-as-js-loader.mjs`) para poder ejecutar archivos `.ts`/`.tsx` con el alias `@/`. Además corregí la implementación de la semana: convertí el listado `/inspecciones` a CSR (con filtro y estados de carga, error y vacío), conecté `loading-state.tsx` mediante `loading.tsx` y `error.tsx` en el detalle, agregué la capa de datos simulada (`src/lib/data/inspections-service.ts`) y alineé `docs/rendering-decision.md` y `README.md` con el código real. Estos cambios tocan archivos de mis compañeras y los hice yo, en una rama propia.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/0091340ac496329f4d222d733f29e8d21b99488d
* **Decisión explicada:** El listado era SSR igual que el detalle, pero la actividad pide comparar una ruta SSR con una CSR. Elegí CSR para el listado porque es la pantalla interactiva (filtra sin recargar) y dejé SSR en el detalle, que es contenido de lectura. Separé la vista (`inspections-view.tsx`) del componente con estado para poder probar cada estado como una función de sus props, sin navegador.
* **Comando/Prueba ejecutada:** `npm run test`, `npm run build` y `npm run verify`.
* **Resultado real:** pass. Pasaron las 14 pruebas de renderizado y las 10 anteriores (starter/manifiesto, service worker y offline). El build compiló y muestra `/inspecciones` como estática con JS de cliente (~2 kB) y `/inspecciones/[id]` como `ƒ` renderizada en el servidor. `npm run verify` terminó con "Verificación técnica: pass" y generó `reports/verification.json`.
* **Qué comprueba y qué no:** Comprueba que el HTML del listado trae solo el estado de carga sin datos (CSR) mientras que el del detalle ya incluye los datos (SSR), que cada estado se renderiza con su rol accesible, que el filtro muestra solo los registros correctos y que los botones Reintentar y de filtro llaman a sus funciones. No ejecuta `useEffect` ni navega en un navegador real, no mide rendimiento y no valida accesibilidad con herramientas automáticas.
* **Limitación:** La latencia de 250 ms es simulada y los datos son locales, así que no hay medición real de CSR contra SSR. No verifiqué la versión de Node del runner de GitHub Actions; las pruebas usan un loader propio en lugar de `--experimental-strip-types` para no depender de ella. Un identificador inexistente en el detalle responde 200 con un mensaje, no un 404 real.
* **Uso de IA:** Usé Claude (Anthropic) para diseñar y escribir la primera versión de las pruebas, el loader, los cambios de código y el borrador del documento. Claude también ejecutó pruebas de mutación (rompió el código a propósito para confirmar que las pruebas fallan) en su entorno de trabajo; esas no las repetí yo. Yo ejecuté localmente `npm run test`, `npm run build` y `npm run verify`, revisé los cambios y los integré en mi rama.

## Semana 5

## Integrante 1: Fatima Avelino Celis

* **Contribución:** Implementación de los esquemas de datos offline (`src/lib/storage/schema.ts`) y la lógica de negocio para la política de resolución de conflictos y prevención de duplicados en la cola (`src/lib/sync/conflict-policy.ts`) para la PWA de inspecciones de laboratorios de la UTT.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/72eb95369d31059396c18779317c2b9dab0f6973
* **Decisión explicada:** Se implementó una política de resolución basada en *Last-Write-Wins* comparando las marcas de tiempo en formato ISO (`updatedAt`) convertidas a milisegundos mediante `.getTime()`. Esto asegura que si la versión local es más reciente que la del servidor, prevalezca la modificación del usuario incrementando el número de versión, evitando sobreescrituras accidentales de datos. Asimismo, se utilizó el método `.some()` para validar duplicados por ID en la cola de sincronización.
* **Comando/Prueba ejecutada:** Ejecución exitosa de pruebas unitarias personalizadas (`node --import ./tests/register-ts-loader.mjs --test tests/sync.spec.ts`) y validación de compilación de producción con Next.js (`npm run build`).
* **Resultado real:** Las pruebas unitarias de las funciones de conflicto y duplicados pasaron al 100% (`pass 2`, `fail 0`), y el empaquetado de la aplicación completó sin errores de tipado en TypeScript.
* **Limitación y qué no-comprueba:** La lógica desarrollada cubre el modelado estructural, los tipos estrictos y las reglas lógicas de sincronización y control de versiones offline, pero no gestiona directamente las llamadas HTTP reales contra una base de datos en producción ni el almacenamiento físico en IndexedDB del navegador (lo cual corresponde a la integración del ciclo completo).
* **Uso de IA:** Se utilizó Anthropic (Claude) como herramienta de apoyo para estructurar las interfaces de TypeScript, refinar la lógica algorítmica de comparación de marcas de tiempo en la política de conflictos y diseñar los casos de prueba unitarios, con validación humana mediante la ejecución local de Node.js y verificación de tipos.

## Integrante 2: Janeth Cabrera Arguelles
* **Contribución:** Implementación de la cola de reintentos y envío diferido de sincronización (`src/lib/sync/queue.ts`), junto con la redacción del documento de políticas de sincronización offline (`docs/sync-policy.md`).
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/41be510afb982915bf14eb155c2c1087d3adf274
* **Decisión explicada:** Se implementó una cola persistente en LocalStorage con deduplicación de ítems por ID y límite configurable de 3 reintentos. Esto asegura que ante caídas temporales de red las operaciones offline se despachen ordenadamente al recuperar conectividad sin saturar el servidor con peticiones redundantes.
* **Comando/Prueba ejecutada:** `npm ci`, `npm run build` y `npm run test`
* **Resultado real:** pass. El módulo de la cola se integra correctamente con las estructuras de datos y políticas de conflicto, compilando limpiamente sin errores de TypeScript (`✓ Compiled successfully`) y pasando la suite de pruebas automatizadas.
* **Qué comprueba y qué no:** Comprueba la persistencia local de la cola, la deduplicación de registros y la lógica de reintentos con fallbacks. No comprueba automáticamente tiempos de latencia bajo redes 3G/4G reales sin simulación.
* **Limitación:** El almacenamiento en LocalStorage tiene un límite de capacidad (5MB), lo cual es suficiente para inspecciones en texto pero requeriría IndexedDB si se anexan fotografías de alta resolución en offline.
* **Uso de IA:** Usé Gemini como apoyo para estructurar las funciones asíncronas de la cola de sincronización y el informe markdown de políticas. Validé manualmente que los tipos importados coincidieran exactamente con la interfaz `SyncQueueItem` definida por el equipo.

## Semana 6

## Integrante 1: Fátima Avelino Celis

* **Contribución:** Implementación de módulos de hardware con permisos mínimos y fallbacks (`src/lib/device/camera.ts` y `src/lib/device/geolocation.ts`) para la PWA de inspecciones.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/a8a322de59a41bd6eeab04855852f66beddcf94c
* **Decisión técnica explicada:** Para la cámara, se solicitó acceso usando `navigator.mediaDevices.getUserMedia` deteniendo el *stream* inmediatamente para evitar el consumo de recursos en segundo plano, e implementando un `<input type="file" capture="environment">` como plan de contingencia (fallback). Para la geolocalización, se configuró `enableHighAccuracy: false` para ahorrar batería y se manejó el error retornando `null` silenciosamente en lugar de arrojar una excepción si el usuario deniega el permiso.
* **Comando/Prueba ejecutada:** Validación estricta de tipos y empaquetado de producción ejecutando `npm run build`.
* **Resultado real:** El proyecto compiló exitosamente, garantizando que el tipado de las APIs nativas del navegador (`Geolocation` y `MediaDevices`) es correcto.
* **Limitación y qué no-comprueba:** El código asume un entorno seguro (HTTPS o localhost). Las pruebas locales no validan el comportamiento físico en dispositivos móviles reales ni las políticas de bloqueo estrictas que algunos navegadores aplican a estas APIs.
* **Uso de IA:** Se utilizó IA como herramienta de apoyo para estructurar el manejo de promesas asíncronas de las APIs nativas, definir los parámetros óptimos para el ahorro de batería en geolocalización y redactar la evidencia técnica.
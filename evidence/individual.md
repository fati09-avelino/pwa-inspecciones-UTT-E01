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
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/b470aa54f9771e4e330b402bd402e101aa9bf930
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

> No necesitan inventar un error ni escribir pruebas nuevas. «Ejecuté npm test» es insuficiente como explicación: indiquen qué observa la prueba y qué comportamiento queda fuera.
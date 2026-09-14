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


## Integrante 1: Fatima Avelino Celis
* **Contribución:** Configuración del archivo de manifiesto PWA (`public/manifest.webmanifest`), diseño, redimensionamiento y colocación de los iconos obligatorios (`192x192` y `512x512`) en la ruta `public/icons/`, e integración de los metadatos en `src/app/layout.tsx` de Next.js.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/eb40e73acc19ab130dd4537107fe2f5396c2c688
* **Decisión explicada:** Se decidió configurar el archivo de manifiesto con el modo de visualización `standalone` y colores corporativos acordes al sistema de inspecciones de la UTT, asegurando que el navegador reconozca la aplicación como instalable tanto en equipos de escritorio como en dispositivos móviles.
* **Comando/Prueba ejecutada:** `npm run test` y validación local en Chrome DevTools (Application > Manifest).
* **Resultado real:** pass. El manifiesto y los iconos fueron detectados correctamente sin errores de ruta (404) ni advertencias de dimensiones.
* **Qué comprueba y qué no:** Comprueba que la estructura sintáctica del archivo `manifest.webmanifest` es válida, que los iconos de 192x192 y 512x512 existen físicamente en las rutas correctas y que la PWA es elegible para instalación. No comprueba la lógica de almacenamiento en caché ni el funcionamiento sin conexión mediante Service Workers.
* **Limitación:** Las pruebas automáticas no validan la experiencia de usuario interactiva tras la instalación ni el comportamiento de red en entornos con conectividad intermitente real.
* **Uso de IA:** Usé Gemini como guía para verificar las propiedades requeridas en el manifiesto PWA de Next.js y los tamaños exactos de redimensionamiento de los iconos, realizando una revisión y validación manual directa en el navegador.


> No necesitan inventar un error ni escribir pruebas nuevas. «Ejecuté npm test» es insuficiente como explicación: indiquen qué observa la prueba y qué comportamiento queda fuera.
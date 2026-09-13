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
* **Contribución:** Configuración inicial del repositorio privado, instalación de dependencias, ejecución de inspecciones locales, redacción de `requirements.md` y `decision-record.md`, y estructuración del proyecto.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/2ab89bc0ff9cb0ab52c6c1a6d12d51885f454c4b
* **Decisión explicada:** Se decidió utilizar datos sintéticos sobre laboratorios de la UTT para evitar manejar datos reales de inventario y cumplir con los lineamientos de privacidad de la práctica.
* **Comando/Prueba ejecutada:** `npm run verify`
* **Resultado real:** pass. El reporte `reports/verification.json` se generó exitosamente.
* **Qué comprueba y qué no:** Comprueba que el proyecto compila, que los archivos requeridos existen y que las pruebas sintéticas pasan. No comprueba si el análisis documental es profundo o si los datos ficticios tienen sentido semántico.
* **Limitación:** El comando no revisa si las invitaciones de GitHub a los colaboradores ya fueron aceptadas.
* **Uso de IA:** Usé Gemini/ChatGPT como guía para estructurar y redactar los escenarios en requirements.md y la tabla en decision-record.md, realizando una revisión humana para confirmar que cumple con los criterios de la rúbrica AC-02.


## Integrante 3: Hector Ulises Cacho Gonzalez
* **Contribución:** Configuración inicial del repositorio privado, instalación de dependencias, ejecución de inspecciones locales, redacción de `requirements.md` y `decision-record.md`, y estructuración del proyecto.
* **Enlace a aportación:** https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01/commit/2ab89bc0ff9cb0ab52c6c1a6d12d51885f454c4b
* **Decisión explicada:** Se decidió utilizar datos sintéticos sobre laboratorios de la UTT para evitar manejar datos reales de inventario y cumplir con los lineamientos de privacidad de la práctica.
* **Comando/Prueba ejecutada:** `npm run verify`
* **Resultado real:** pass. El reporte `reports/verification.json` se generó exitosamente.
* **Qué comprueba y qué no:** Comprueba que el proyecto compila, que los archivos requeridos existen y que las pruebas sintéticas pasan. No comprueba si el análisis documental es profundo o si los datos ficticios tienen sentido semántico.
* **Limitación:** El comando no revisa si las invitaciones de GitHub a los colaboradores ya fueron aceptadas.
* **Uso de IA:** Usé Gemini/ChatGPT y Cloude IA como guía para estructurar y redactar los escenarios en requirements.md y la tabla en decision-record.md, realizando una revisión humana para confirmar que cumple con los criterios de la rúbrica AC-02.


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
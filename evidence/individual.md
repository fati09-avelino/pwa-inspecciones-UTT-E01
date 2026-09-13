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
* **Contribución:** Implementación del App Shell (src/components/app-shell.tsx) con navegación accesible y landmarks (header, nav, main, footer), enlace de salto al contenido ("skip link"), y actualización de src/app/layout.tsx (metadatos, viewport, referencia al manifest) y src/app/page.tsx (estados obligatorios de carga, error y vacío para las inspecciones, con controles de demostración).
* **Enlace a aportación:** ID DE MI SHA:
c52bede963c39512da610b272a1c0a1acae830d5
* **Decisión explicada:** Implementé los tres estados obligatorios (carga, error, vacío) como un cambio de estado local en page.tsx, controlado por botones de demostración, en lugar de simularlos con temporizadores automáticos. Esto permite que cualquier evaluador los revise e inspeccione en cualquier momento sin depender de tiempos de espera ni de una API real.
* **Comando/Prueba ejecutada:** `npm run build`
* **Resultado real:** compiló sin errores. Verifiqué también manualmente con teclado (tecla Tab) que el enlace "Saltar al contenido principal" y los botones de simulación de estado son accesibles sin usar el mouse.
* **Qué comprueba y qué no:** Comprueba que el App Shell, la navegación y los tres estados de interfaz existen y son funcionales/inspeccionables, y que el proyecto compila. No comprueba automáticamente el contraste de color ni el comportamiento ante una falla de red real (los estados de carga/error son simulados manualmente, no provienen de una petición fallida real).
* **Limitación:** Los estados de carga y error son representaciones visuales activadas manualmente; no reflejan aún una llamada de red real, ya que el manifiesto y las pruebas automatizadas todavía no estaban integrados en el momento de este commit.
* **Uso de IA:** Usé Claude (Anthropic) como apoyo para generar una primera versión de app-shell.tsx, page.tsx y los estilos asociados en globals.css, siguiendo la estructura y clases ya existentes del proyecto de la Semana 1. Revisé y probé el código localmente (npm run dev, npm run build, navegación por teclado) para confirmar que cumple los requisitos antes de integrarlo y puedo explicar cada decisión de implementación.

> No necesitan inventar un error ni escribir pruebas nuevas. «Ejecuté npm test» es insuficiente como explicación: indiquen qué observa la prueba y qué comportamiento queda fuera.
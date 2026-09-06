# Requisitos del producto — documento del equipo

> Sustituyan las orientaciones por su análisis. Los ejemplos muestran el formato; pueden usar otros equivalentes. Los requisitos del producto futuro se documentan ahora y se implementarán en las semanas correspondientes. No hay una cantidad nueva obligatoria de requisitos.

## 1. Problema y contexto

**Problema:** Dificultad para mantener un registro actualizado y confiable de las inspecciones de mantenimiento en los laboratorios de la UTT, agravado por la mala conexión a internet en ciertas áreas (como sótanos o laboratorios cerrados).
**Límites:** El sistema se limitará exclusivamente al registro y consulta de hallazgos de mantenimiento. Quedan fuera la gestión de compras de refacciones, cotizaciones, o asignación de presupuestos.
## 2. Usuarios y escenarios

**Usuarios:** Inspectores de mantenimiento de la UTT.
* **Escenario 1 (Conectividad estable):** El inspector revisa el Laboratorio de Redes (con buen WiFi). Acción: Llena el formulario de inspección y presiona guardar. Resultado esperado: Los datos se envían inmediatamente al servidor y aparecen en su historial.
* **Escenario 2 (Conectividad intermitente/Offline):** El inspector revisa el cuarto de máquinas en el sótano (sin internet). Acción: Llena el formulario y presiona guardar. Resultado esperado: El sistema guarda la inspección localmente, avisa que está "Pendiente de sincronizar" y, al recuperar la red al salir del sótano, se sincroniza automáticamente en segundo plano.

## 3. Requisitos funcionales

| ID | Acción del producto | Condición observable de aceptación | Ahora o futuro |
|---|---|---|---|
| RF-01 | Mostrar los registros sintéticos del starter | Al abrir la página `http://localhost:3000` se ven las tres inspecciones proporcionadas por el código base. | Semana 1 |
| RF-02 | Registrar una nueva inspección con laboratorio, fecha y hallazgo | Al guardar datos válidos, aparece un registro nuevo en la lista con esos mismos valores. | Futuro |
| RF-03 | Guardar datos de inspección sin conexión a internet | Si se apaga la red del dispositivo, el formulario permite guardar sin mostrar error y el sistema lo sincroniza al reconectar. | Futuro |

## 4. Requisitos no funcionales

* **RNF-01 (Reproducibilidad):** El proyecto debe instalarse con `npm ci` sin errores. Se comprueba mediante CI/CD (GitHub Actions) en cada push.
* **RNF-02 (Accesibilidad):** La interfaz debe ser navegable con teclado. Se comprobará usando la extensión Lighthouse en las semanas de desarrollo UI.
* **RNF-03 (Operación Offline - Futuro):** La app debe cargar la pantalla inicial sin internet. Se comprobará apagando la red en las DevTools del navegador.

## 5. Datos sintéticos y límites

* **Datos ficticios:** Nombres de laboratorios (ej. "Lab A1"), fechas pasadas/futuras generadas por código, y hallazgos sintéticos ("Cable suelto", "Foco fundido").
* **Datos reales excluidos:** Nombres reales de estudiantes, profesores o personal administrativo; inventarios reales con costos; credenciales de acceso reales de la UTT.

## 6. Criterios de aceptación de la Semana 1

* **Pruebas del starter y estructura:** Se verifican mediante la ejecución del comando `npm run verify` (comprobación técnica automatizada).
* **Build del proyecto:** Se verifica mediante la compilación exitosa al ejecutar `npm run verify` o `npm run build` (comprobación técnica automatizada).
* **Requisitos verificables, usuarios y escenarios:** Se verifican mediante la lectura y evaluación del docente de este documento (`docs/requirements.md`).
* **Comparación de alternativas y justificación PWA:** Se verifican mediante la lectura y evaluación del docente del documento `docs/decision-record.md`.
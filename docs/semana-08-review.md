# Revisión de semana 8 · Ulises

Fecha de revisión: 25 de octubre de 2026 (Ciudad de México).
Repositorio: https://github.com/fati09-avelino/pwa-inspecciones-UTT-E01
Base inicial: develop, b474d68. Actualización incorporada: develop, 3fbc707 (PR #26 y #27 de Fátima). Rama de aportación: tests/semana-8-integracion-ci; destino del PR #25: develop.

## Alcance y fuentes

Se leyó ACTIVIDAD.txt y PLANTILLA-EVIDENCIA.md del ZIP proporcionado, la distribución
de tareas de las capturas y el código del repositorio actualizado mediante fetch.
El ZIP es una fuente de requisitos académicos, no autorización para entregar por
la cuenta del estudiante. No se consultó el quiz ni se enviaron mensajes al equipo.
Classroom no se pudo verificar: fecha/hora exactas, acceso del docente y entrega
individual siguen pendientes de confirmación humana.

## Diagnóstico del proyecto

- Next.js 14.2.35, React 18.3.1, TypeScript; listado CSR y detalle SSR.
- El listado y detalle consultan datos sintéticos estáticos, no las operaciones de la cola.
- queue.ts guarda la cola en LocalStorage. schema.ts solo define tipos, no IndexedDB.
- processSyncQueue no tiene consumidores en la interfaz. No existe /api/inspecciones.
- Las herramientas de cámara, ubicación y avisos sí aparecen en el listado, pero no
  están conectadas a una inspección nueva persistida. La imagen seleccionada y ubicación
  solo viven en el estado del componente.
- El service worker intenta precachear /icon-192.png y /icon-512.png, pero los archivos
  están en /icons/. Además no almacena las respuestas de red ni los chunks de Next.
  No está demostrado que recargar /inspecciones completamente offline cargue la aplicación.
- Tras tres fallos, la cola elimina la operación. Quedan fuera de esta aportación:
  recuperación manual, concurrencia entre pestañas y cambios de payload después de que
  el remoto haya aplicado una operación cuya respuesta se perdió.
- Las unitarias de Fátima inicialmente contenían funciones copiadas. La corrección incorporada desde develop importa validateInspection de src/lib/data/inspections.ts y addToSyncQueue/getSyncQueue de src/lib/sync/queue.ts. Las cuatro pruebas evalúan esas funciones reales. Sigue pendiente conectar la validación al flujo de captura de la interfaz.
- El npm test anterior omitía tests/sync.spec.ts y tests/unit/logic.spec.ts.
- Los tests históricos .ts son JavaScript ejecutado mediante un loader de transpilación,
  con globals simuladas sin tipado TS. Incluirlos en tsc estricto producía errores.
  Ahora tsc comprueba src/, las unitarias TS y los futuros E2E TS. Los históricos siguen
  ejecutándose, sin ocultar errores del código de producción con ignoreBuildErrors.

## Tu aportación

1. Seis pruebas de integración que ejecutan el queue.ts real en Chromium. Se empaqueta
   el módulo con esbuild; se usa LocalStorage real y se recarga el documento. El remoto
   se controla con fixtures y se aísla cada caso con un contexto nuevo.
2. Casos: guardar offline/persistir/reconectar, respuesta perdida después de aplicar,
   HTTP 503 y recuperación, edición sin duplicar la cola, dos IDs y métodos HTTP,
   y aislamiento del estado.
3. El remoto no deduplica por ID de inspección: deduplica por Idempotency-Key. Así no
   oculta la falta de protección del cliente. Antes del arreglo fallaron dos casos;
   después pasan seis. Se añadió la identidad persistida de la operación a los headers.
4. CI unificado en .github/workflows/academic-evaluation.yml, sustituyendo el equivalente
   week-02-w02-shell-manifest.yml. Ejecuta npm ci, instala Chromium, y make verify.
   El verificador ejecuta todas las etapas aunque alguna falle y devuelve error global.
   Conserva logs, JUnit, HTML, traces de fallo y cobertura con if: always().
5. Las pruebas Node generan cobertura c8 (LCOV/HTML/JSON) y resultados JUnit.
   La cobertura mide src/lib y src/components bajo pruebas Node; NO mide navegación E2E.
   Los tipos borrados al transpilar pueden aparecer sin cobertura. No hay umbral inventado.
6. El workflow histórico de semana 1 conserva sus pruebas anteriores y build; no exige
   Chromium ni duplica toda la evaluación nueva.
7. Se preparó el contrato de ejecución para los E2E de Janeth; no se inventaron tests
   de interfaz ni se dio por cubierta esa capa.

## Matriz de coordinación

| Riesgo / requisito | Responsable | Estado y siguiente paso |
| --- | --- | --- |
| Guardar offline persiste | Ulises | Integración comprobada con LocalStorage real |
| Reintentar sin duplicar remoto | Ulises | Comprobado con respuesta perdida y clave estable |
| Lint, tipos, build, reportes y CI | Ulises | Configurados; consultar resultados reales del SHA |
| Validación e idempotencia unitaria | Fátima | Corregidas e incorporadas desde develop; importan funciones reales |
| Crear inspección desde pantalla | Equipo | Implementar consumidor de persistencia y cola |
| Recarga completamente offline | Equipo | Corregir y comprobar shell/chunks con navegador |
| E2E normal y capacidad denegada | Janeth | Añadir pruebas Playwright reales en tests/e2e/ |
| Estrategia, diagnóstico y matriz final | Janeth | Falta docs/test-strategy.md; enlazar este diagnóstico |
| Evidencia individual | Cada integrante | Revisar personalmente antes de afirmar validación humana |

## Evidencia de fallo y recuperación

- evidence/semana08/integration-before.txt: defecto real encontrado antes de la corrección.
- evidence/semana08/integration-after.txt: seis casos pasan tras enviar la clave.
- evidence/semana08/controlled-failure.txt: en rama temporal
  tests/semana-8-defecto-controlado se retiró el header y el test de respuesta perdida falló.
- evidence/semana08/controlled-recovery.txt: header restaurado y suite recuperada.
- reports/verification.json: estado de todas las etapas; se genera, no se versiona.
- El defecto temporal nunca debe integrarse. La demostración la ejecutó Codex; no se
  atribuye falsamente a una ejecución manual de Ulises.

La integración recarga un documento de prueba servido mediante interceptación.
Esto demuestra persistencia del almacenamiento, no disponibilidad offline de la interfaz
ni idempotencia de un backend real. El endpoint futuro debe respetar el mismo contrato.

## Antes de entregar

Integrar primero por PR a develop, nunca por cambios directos a develop o main. El CI debe fallar mientras falten
docs/test-strategy.md o tests E2E: no usar --pass-with-no-tests ni --if-present para ocultarlo.
Una ejecución verde tampoco valida por sí misma que las unitarias prueben producción.
Tras integrar todas las contribuciones, ejecutar CI del SHA común y entregar ese SHA
con sus enlaces y la evidencia individual. No crear otro commit para escribir dentro
de él su propio SHA.

## Dependencias

La instalación limpia terminó con código 0. `npm audit` reportó 6 vulnerabilidades (5 altas y 1 crítica): Next existente y su cadena, además de la configuración de lint alineada con Next 14. No se ejecutó `npm audit fix --force`: propone migrar a Next 16 y cambiaría el alcance de esta aportación. Este hallazgo requiere una actualización separada y su validación; CI académico verde no equivale a una revisión de seguridad.

## Comprobación local completa

`npm ci` terminó con código 0. La compilación directa `node node_modules/next/dist/bin/next build` terminó con código 0. El wrapper completo `npm run verify` conservó un fallo EPERM de escritura en .next al invocar el build desde este entorno restringido de Windows, y un fallo E2E (ausencia de tests; se observó también un puerto retenido por una ejecución anterior, ya detenida). No se marca la verificación global como aprobada. La ejecución de Actions en Linux es la comprobación independiente del mismo código.

## Actualización de la rama de Ulises

Se incorporan los cuatro commits nuevos de develop conservando la evidencia revisada de Fátima y la sección completa de Ulises. El conflicto de evidence/individual.md se resuelve combinando ambas secciones, sin aceptar un lado completo y perder la otra aportación. No se integra el PR #25 a develop ni se modifica main. La estrategia, los E2E y el flujo común siguen pendientes hasta que sus archivos y pruebas estén integrados.

### Comprobación después de incorporar develop

Sobre el proyecto de Descargas se ejecutaron las etapas directamente con Node: lint sin avisos, tipos sin errores, 79 pruebas Node y 6 de integración aprobadas, y build de Next terminado con código 0. Los comandos directos fueron node scripts/test-node.mjs, node node_modules/next/dist/bin/next lint --dir src --max-warnings 0, node node_modules/typescript/bin/tsc --noEmit, node node_modules/@playwright/test/cli.js test --config playwright.integration.config.mjs y node node_modules/next/dist/bin/next build. npm ci volvió a encontrar EPERM; se restauraron dependencias desde la copia previamente instalada cuyo package-lock.json tiene el mismo hash. El wrapper npm run verify se interrumpió al quedar detenido en lint en este entorno; no se declara aprobado. La comprobación de estructura encontró pendiente docs/test-strategy.md y el listado E2E encontró cero tests. La validación humana de Ulises sigue pendiente; estos comandos los ejecutó Codex.

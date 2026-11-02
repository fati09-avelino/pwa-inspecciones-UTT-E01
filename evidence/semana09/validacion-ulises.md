# Verificación de Ulises · Semana 9

Fecha: 2026-10-30. Ejecutor: Codex (OpenAI), por solicitud de Ulises.
Base: `c7a8fe7a8e03f73143046e5c66cc5037cf00595f` de develop.

| Comprobación local | Resultado observado |
| --- | --- |
| `npm run test:security` | 2 pruebas de Fátima aprobadas |
| `node node_modules/c8/bin/c8.js node scripts/test-node.mjs` | 82 pruebas Node aprobadas; cobertura generada |
| `npm run lint` / CLI equivalente de Next | sin avisos ni errores |
| `npm run typecheck` / CLI equivalente de TypeScript | código 0 |
| `npm run build` / CLI equivalente de Next | compilación de producción correcta |
| `npm run test:integration` / CLI equivalente de Playwright | 6 pruebas aprobadas |
| E2E nuevos en servidor de producción | 3 escenarios aprobados |
| Todos los E2E, reutilizando ese servidor | 9 aprobados |
| `node scripts/verify-week09.mjs --structure` | código 1: faltan `docs/privacy-data-inventory.md` y `public/robots.txt` de Janeth |
| `npm audit --omit=dev --json` | 3 dependencias vulnerables: Next crítica, postcss y source-map-js altas |
| `git diff --check` | sin errores de espacios o marcas de conflicto |

La comprobación local del conjunto E2E reutilizó el servidor de producción que
inició Playwright porque el cierre del wrapper de servidor quedó retenido en
Windows. La configuración temporal se guardó en `reports/` (ignorado), sin cambiar
la configuración normal. La primera ejecución observó los tres casos aprobados;
la repetición completa terminó con 9 aprobados. La ejecución independiente de
instalación limpia y verificación completa corresponde al workflow Linux del PR.
No se afirma que una ejecución local de `npm ci && make verify` haya concluido.

Los logs locales se generan en `reports/build-w09.log`, `node-coverage-w09.log`,
`integration-w09.log`, `security-e2e-w09.log`, `e2e-all-w09.log` y `audit-w09.json`.
El workflow genera y conserva sus propios logs y `evaluation-result.json` con el
SHA que realmente evalúa, evitando atribuir estos resultados a otro commit.

## Contraste con el kit del docente

Se leyó `PWA-w09-kit-estudiante.zip`: `ASSIGNMENT.md`, `evaluation.json`, plantilla
de workflow, evidencia y prueba pública. El workflow se adapta al proyecto
acumulado: pruebas explícitas, Node declarado, reportes reales y control de salida.
No se usa `--if-present` para omitir una suite ausente ni se inventan checks privados
o puntuaciones. El reporte es feedback técnico, no una calificación.

El `public-tests/check.sh` del kit busca palabras como `secret`, `password`, `token`
o `api_key` en cualquier archivo. Eso puede marcar documentación y dependencias
sin que exista una credencial. No se modifica el test ni se renombra documentación
para eludirlo; un hallazgo necesita contexto. El comprobador estructural propio
declara con precisión los entregables del equipo que todavía faltan.

## Pendientes reales

1. Integrar desde el PR de Janeth su inventario de privacidad y `robots.txt`, y
   repetir el workflow de Semana 9 sobre el SHA combinado.
2. Revisar las vulnerabilidades antes de un despliegue real y planificar la
   migración de dependencias en un PR separado; la auditoría de este CI es informativa.
3. Ulises debe revisar y comprender el modelo/diff y repetir los comandos. Su
   validación humana no ha sido realizada por Codex ni se declara completada.

No se modificó main, no se publicaron secretos y no se entregó en Classroom.

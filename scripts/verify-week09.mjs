import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const required = ['docs/threat-model.md', 'docs/privacy-data-inventory.md',
  'src/lib/security/index.ts', 'tests/security.spec.ts', 'public/robots.txt',
  'README.md', 'evidence/individual.md',
  '.github/workflows/week-09-w09-security-privacy.yml'];
const missing = required.filter(path => !existsSync(resolve(root, path)) ||
  !readFileSync(resolve(root, path), 'utf8').trim());
const structureOnly = process.argv.includes('--structure');
mkdirSync(resolve(root, 'reports'), { recursive: true });
const checks = [{ id: 'week09-artifacts', status: missing.length ? 'fail' : 'pass', missing }];
if (!structureOnly) {
  // Conserva todas las pruebas de las semanas anteriores, incluido security.spec.ts.
  // La verificación se ejecuta incluso cuando faltan entregables de otra rama.
  const run = spawnSync(process.execPath, ['scripts/verify.mjs'], { cwd: root, stdio: 'inherit' });
  checks.push({ id: 'full-verification', status: run.status === 0 && !run.error ? 'pass' : 'fail',
    exitCode: run.status, error: run.error?.message || null });
}
function git(args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}
const report = {
  schemaVersion: 1, assignmentId: 'w09-security-privacy',
  mode: structureOnly ? 'structure-only' : 'full', checkedAt: new Date().toISOString(),
  commitSha: git(['rev-parse', 'HEAD']), branch: git(['branch', '--show-current']),
  workingTreeClean: git(['status', '--porcelain']) === '', runtime: { node: process.version },
  status: checks.every(check => check.status === 'pass') ? 'pass' : 'fail', checks,
  limits: ['Feedback técnico; no asigna puntos ni ejecuta checks privados del docente.',
    'La presencia de documentos no demuestra su calidad ni el cumplimiento legal.',
    'La auditoría npm se ejecuta aparte y debe revisarse aunque las pruebas pasen.',
    'La validación humana de cada integrante debe declararse por separado.'],
};
writeFileSync(resolve(root, 'evaluation-result.json'), JSON.stringify(report, null, 2) + '\n');
console.log('Semana 9: ' + report.status + '. Reporte: evaluation-result.json');
if (missing.length) console.error('Artefactos ausentes o vacíos: ' + missing.join(', '));
process.exit(report.status === 'pass' ? 0 : 1);

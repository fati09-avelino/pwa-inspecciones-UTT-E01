import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
const required = ['tests/unit', 'tests/integration', 'tests/e2e', 'docs/test-strategy.md',
  '.github/workflows/academic-evaluation.yml', 'README.md', 'evidence/individual.md'];
const missing = required.filter(file => !existsSync(resolve(root, file)));
if (process.argv.includes('--structure')) {
  console.log(missing.length ? 'Faltan: ' + missing.join(', ') : 'Estructura presente; contenido no evaluado.');
  process.exit(missing.length ? 1 : 0);
}
mkdirSync(resolve(root, 'reports'), { recursive: true });
const checks = [{ id: 'structure', status: missing.length ? 'fail' : 'pass', missing }];
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
for (const id of ['lint', 'typecheck', 'build', 'test:coverage', 'test:integration', 'test:e2e']) {
  console.log('\nVerificando ' + id + '...');
  const run = spawnSync(npm, ['run', id], {
    cwd: root, encoding: 'utf8', shell: process.platform === 'win32',
    maxBuffer: 30 * 1024 * 1024, timeout: 10 * 60 * 1000,
  });
  const output = (run.stdout || '') + (run.stderr || '');
  process.stdout.write(output);
  writeFileSync(resolve(root, 'reports', id.replaceAll(':', '-') + '.log'), output);
  checks.push({ id, status: run.status === 0 && !run.error ? 'pass' : 'fail', exitCode: run.status, error: run.error?.message || null });
}
const git = args => {
  const run = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return run.status === 0 ? run.stdout.trim() : null;
};
const result = {
  schemaVersion: 3, checkedAt: new Date().toISOString(),
  commitSha: git(['rev-parse', 'HEAD']), branch: git(['branch', '--show-current']),
  workingTreeClean: git(['status', '--porcelain']) === '',
  runtime: { node: process.version },
  status: checks.every(check => check.status === 'pass') ? 'pass' : 'fail', checks,
  limits: ['npm ci se verifica por separado.', 'La cobertura de c8 mide pruebas Node, no los E2E.',
    'La integración usa LocalStorage real con documento y servidor simulados; no prueba la interfaz.',
    'No es una calificación ni certificación de ausencia de secretos.'],
};
writeFileSync(resolve(root, 'reports/verification.json'), JSON.stringify(result, null, 2) + '\n');
console.log('\nVerificación técnica: ' + result.status + '. Reporte: reports/verification.json');
process.exit(result.status === 'pass' ? 0 : 1);

import { readdirSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const mode = process.argv[2] || 'all';
mkdirSync('reports/node', { recursive: true });
const legacy = readdirSync('tests').filter(file => /\.spec\.(ts|mjs)$/.test(file) && file !== 'manifest.spec.ts').map(file => 'tests/' + file);
const unit = readdirSync('tests/unit').filter(file => /\.spec\.(ts|mjs|js)$/.test(file)).map(file => 'tests/unit/' + file);
const files = mode === 'unit' ? unit : mode === 'legacy' ? legacy : [...legacy, ...unit];
if (!files.length) { console.error('No se encontraron pruebas obligatorias: ' + mode); process.exit(1); }
const result = spawnSync(process.execPath, [
  '--import', './tests/register-ts-loader.mjs', '--test',
  '--test-reporter=spec', '--test-reporter=junit',
  '--test-reporter-destination=stdout', '--test-reporter-destination=reports/node/' + mode + '.xml',
  ...files,
], { stdio: 'inherit' });
if (result.error) console.error(result.error);
process.exit(result.status ?? 1);

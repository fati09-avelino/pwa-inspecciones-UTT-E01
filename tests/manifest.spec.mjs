import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Verificar existencia y campos obligatorios del manifest.webmanifest', () => {
  const manifestPath = path.resolve(process.cwd(), 'public/manifest.webmanifest');
  
  // 1. Verificar que el archivo físico existe en la carpeta public
  assert.strictEqual(
    fs.existsSync(manifestPath), 
    true, 
    'El archivo public/manifest.webmanifest debe existir obligatoriamente.'
  );
  
  // 2. Leer y parsear el contenido JSON
  const content = fs.readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(content);

  // 3. Validar propiedades obligatorias de una PWA instalable
  assert.ok(manifest.name, 'El manifiesto debe incluir la propiedad "name".');
  assert.ok(manifest.start_url, 'El manifiesto debe incluir la propiedad "start_url".');
  assert.strictEqual(manifest.display, 'standalone', 'La propiedad "display" debe configurarse como "standalone".');
});


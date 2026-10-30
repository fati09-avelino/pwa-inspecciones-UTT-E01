import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeInput } from '../src/lib/security/index';
import { validateInspection } from '../src/lib/data/inspections';

describe('Pruebas de Seguridad: Sanitización y XSS', () => {
  it('debe escapar caracteres peligrosos (XSS)', () => {
    const maliciousInput = '<script>alert("hack")</script>';
    const safeOutput = sanitizeInput(maliciousInput);
    
    assert.equal(safeOutput.includes('<script>'), false);
    assert.equal(safeOutput.includes('&lt;script&gt;'), true);
  });

  it('debe neutralizar código inyectado en una inspección real', () => {
    const dirtyData = {
      id: 'INS-999',
      laboratory: 'Laboratorio de Redes',
      notes: 'Revisión <b onmouseover="alert(1)">Peligro</b>',
    };
    
    const isValid = validateInspection(dirtyData);
    assert.equal(isValid, true);
    assert.equal(dirtyData.notes.includes('<b'), false);
    assert.equal(dirtyData.notes.includes('&lt;b'), true);
  });
});

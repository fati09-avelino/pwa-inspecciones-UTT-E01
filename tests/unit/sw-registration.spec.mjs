import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerServiceWorker } from '../../src/lib/pwa/register-service-worker.ts';

test('registra el Service Worker aunque la hidratación ocurra después de load', async () => {
  const saved = new Map(['window', 'navigator', 'document'].map(key =>
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const registrations = [];
  const env = {
    window: { addEventListener() { throw new Error('load ya ocurrió'); } },
    document: { readyState: 'complete' },
    navigator: { serviceWorker: { register: async url => {
      registrations.push(url); return { scope: '/' };
    } } },
  };
  try {
    for (const [key, value] of Object.entries(env)) Object.defineProperty(globalThis, key,
      { configurable: true, writable: true, value });
    registerServiceWorker();
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(registrations, ['/sw.js']);
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});

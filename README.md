# PWA Inspecciones y Mantenimiento de Laboratorios - UTT

Proyecto correspondiente a la materia de PWA (Grupo 10 A - Equipo 1).

## Requisitos de la Semana 03: Service Worker y Consulta Offline

En esta iteración se incorporaron las capacidades PWA de funcionamiento sin conexión:
- Registro del Service Worker con ciclo de vida seguro (`src/lib/pwa/register-service-worker.ts`).
- Service Worker funcional con estrategias de precaché y fallback offline (`public/sw.js`).
- Documentación de la estrategia de almacenamiento y expiración (`docs/cache-strategy.md`).
- Pruebas automatizadas de ciclo de vida e interceptación offline (`tests/service-worker.spec.ts` y `tests/offline.spec.ts`).

## Setup e Instalación

1. **Instalación Inmutable de Dependencias:**
   ```bash
   npm ci
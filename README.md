# PWA Inspecciones y Mantenimiento de Laboratorios - UTT

Proyecto integrador correspondiente a la materia de PWA (Grupo 10 A - Equipo 1).

## Arquitectura de la Semana 04: Renderizado SSR y Estados Verificables

En esta iteración se consolidó la estrategia de renderizado y resiliencia offline:
- **Ruta de Listado (`src/app/inspecciones/page.tsx`):** Vista SSR para la visualización del catálogo de inspecciones sintéticas con captura de estados de error.
- **Ruta de Detalle (`src/app/inspecciones/[id]/page.tsx`):** Vista SSR dinámicamente parametrizada por ID de laboratorio.
- **Componente de Carga (`src/components/loading-state.tsx`):** Indicador de carga accesible (*spinner*) para experiencias de espera.
- **Estrategia de Renderizado (`docs/rendering-decision.md`):** Documentación técnica de decisiones de arquitectura, trade-offs y manejo de resiliencia.
- **Pruebas Automatizadas (`tests/offline.spec.ts` y `tests/service-worker.spec.ts`):** Verificación del comportamiento del Service Worker, navegación offline y renderizado en servidor.

---

## Setup, Ejecución y Verificación

### 1. Instalación Inmutable
```bash
npm ci
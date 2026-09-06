# ADR-001 — Decisión sobre la estrategia de aplicación

> ADR significa registro de decisión arquitectónica. Este documento explica la comparación, la elección y sus consecuencias. Es un documento del equipo; adapten los ejemplos al caso.

## Estado

Aceptada por el equipo — 4 de septiembre de 2026.

## Contexto y restricciones

El producto será utilizado por inspectores de mantenimiento de la UTT moviéndose físicamente entre distintos laboratorios. La restricción principal es la conectividad intermitente (ej. falta de internet en los sótanos). El sistema debe funcionar en dispositivos móviles y, por restricciones de privacidad del curso, manejará exclusivamente datos sintéticos (sin credenciales reales). 

Esta decisión está directamente influenciada por los escenarios de uso y los requisitos de operar offline en el futuro (ver RF-03 en `requirements.md`).

## Alternativas consideradas

| Característica | Web Tradicional | App Nativa (iOS/Android) | App Multiplataforma | PWA (Progressive Web App) |
|---|---|---|---|---|
| **Instalación** | No requiere | Desde App Stores | Desde App Stores | Desde el navegador |
| **Offline** | Nulo | Excelente | Excelente | Soportado mediante Service Workers |
| **Distribución** | Por URL inmediata | Fricción alta (tiendas) | Fricción alta (tiendas) | Por URL inmediata |
| **Costo de desarrollo**| Bajo (un código) | Alto (dos códigos distintos) | Medio (un código) | Medio (un código adaptativo) |
| **Mantenimiento** | Sencillo | Complejo | Medio | Sencillo |
| **Acceso al dispositivo**| Muy limitado | Total | Muy alto | Bueno, con algunas restricciones (ej. iOS) |
| **Riesgos** | Falla total sin internet | Alto costo para una app interna | Fricción de descarga innecesaria | Límite de cuota de almacenamiento local |
## Decisión

Se decide adoptar la estrategia **PWA fijada para el curso, utilizando Next.js**. 
Dado que los usuarios son personal interno de la UTT, evitar la fricción de publicar y descargar una aplicación desde las tiendas oficiales (como exigen las apps Nativas o Multiplataforma) agiliza la distribución. Al mismo tiempo, la PWA permite superar la restricción principal (falta de internet en sótanos) gracias a los Service Workers, algo que una Web Tradicional no puede hacer. 

Otra alternativa (como App Multiplataforma) solo sería preferible si en el futuro se requiriera integración profunda y compleja con sensores del dispositivo móvil que el navegador no pueda acceder.

## Consecuencias y riesgos

* **Beneficios:** Un solo código base para mantener, distribución instantánea por URL, y capacidad de registrar inspecciones en zonas sin cobertura.
* **Costos y Riesgos:** Conservar datos en el dispositivo permite la continuidad sin conexión, pero exige diseñar un sistema para manejar conflictos al reconectar (por ejemplo, si dos inspectores editan el mismo registro).
* **Mitigaciones:** Se implementará una arquitectura de datos locales y sincronización diferida cuidadosa, limitando la edición simultánea para reducir choques de datos.

## Validación

En semanas posteriores, validaremos esta decisión mediante pruebas de campo simuladas:
1. Cargaremos la aplicación.
2. Apagaremos la conexión a internet en las herramientas de desarrollador (DevTools).
3. Intentaremos crear un registro de inspección de laboratorio.
4. Reconectaremos la red para observar la sincronización.
*Actualmente no se ha validado esta sincronización ni el soporte offline, ya que se implementarán a futuro según el alcance del curso.*

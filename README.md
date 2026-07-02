# Taskify

Tablero Kanban colaborativo construido como proyecto de práctica para explorar **Spec-Driven Development (SDD)** con [Spec Kit](https://github.com/github/spec-kit) y Claude Code.

## Stack

- Vite + JavaScript vanilla
- HTML y CSS sin frameworks
- SQLite (especificado, pero no implementado — ver nota al final)

## Metodología: Spec-Driven Development

En lugar de codear directamente, este proyecto siguió el flujo completo de SDD:

1. **Constitución** — principios de calidad, testing y experiencia de usuario que gobiernan todas las decisiones
2. **Especificación** — descripción funcional de Taskify sin mencionar el stack: qué construir y por qué
3. **Clarificación** — resolución de ambigüedades antes de planear (`/speckit.clarify`)
4. **Plan técnico** — decisiones de arquitectura y stack con `/speckit.plan`
5. **Tareas** — desglose accionable con dependencias y marcadores de ejecución paralela (`/speckit.tasks`)
6. **Implementación** — ejecución automatizada por el agente (`/speckit.implement`)

Los artefactos generados (constitución, spec, plan, tareas) están en `.specify/` y `specs/`.

## Lo que funciona

- Vista de usuarios predefinidos al iniciar
- Tres proyectos de ejemplo con tareas distribuidas entre columnas
- Tablero Kanban con columnas To Do / In Progress / In Review / Done
- Drag and drop entre columnas
- Tarjetas del usuario actual destacadas visualmente
- Comentarios por tarjeta

## Nota sobre persistencia

Se especificó SQLite como base de datos para persistir cambios entre sesiones. El agente no lo implementó — los tableros funcionan solo en memoria y se reinician al recargar. Es un hallazgo honesto del proceso: SDD reduce el trabajo de implementación, pero no reemplaza la revisión detallada de cada artefacto antes de ejecutar.

## Relacionado

- Tutorial completo de instalación y uso: https://medium.com/@sirpyerre/conociendo-spec-driven-development-730f1f325ea0?sk=862d1d09d266b0a8f593df1b729d5e28

- Repo de Spec Kit: [github.com/github/spec-kit](https://github.com/github/spec-kit)

## Licencia

MIT
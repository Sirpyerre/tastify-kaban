# Contract: Utility Modules (`src/utils/`)

**Feature**: 001-kanban-board
**Date**: 2026-06-26

---

## `src/utils/router.js`

Hash-based client-side router. Routes are URL fragments (`#/projects`, `#/projects/:id`).
No external library.

### Exports

#### `navigate(path: string): void`
Navigates to the given hash path (e.g., `'/projects/abc-123'`).
Sets `window.location.hash` and triggers the registered route handler.

#### `onRoute(pattern: string, handler: (params: object) => void): void`
Registers a handler for a route pattern.
- Patterns support `:param` segments (e.g., `'/projects/:id'`).
- `params` object contains named captures (e.g., `{ id: 'abc-123' }`).
- Handlers are evaluated in registration order; first match wins.

#### `start(): void`
Begins listening to `hashchange` and `load` events. Evaluates the current hash immediately
on call. Must be called once during app initialization.

---

## `src/utils/dnd.js`

Wraps the native HTML5 Drag and Drop API for use with task cards and column drop zones.

### Exports

#### `makeDraggable(element: HTMLElement, taskId: string): void`
Marks `element` as draggable and encodes `taskId` into the drag event's data transfer.
- Sets `element.draggable = true`.
- Attaches `dragstart` handler that calls `dataTransfer.setData('text/plain', taskId)`.
- Adds a `--dragging` CSS class to `element` during the drag, removes it on `dragend`.

#### `makeDropTarget(element: HTMLElement, onDrop: (taskId: string) => void): void`
Marks `element` as a drop target for task cards.
- Attaches `dragover` handler that calls `event.preventDefault()` and adds `--drag-over` CSS
  class to `element`.
- Attaches `dragleave` handler that removes `--drag-over` class.
- Attaches `drop` handler that reads `taskId` from `dataTransfer`, removes `--drag-over` class,
  and calls `onDrop(taskId)`.

---

## `src/utils/id.js`

### Exports

#### `generateId(): string`
Returns `crypto.randomUUID()`. Wrapper exists so tests can substitute a deterministic ID
generator without patching the global `crypto` object.

---

## `src/utils/time.js`

### Exports

#### `nowUnix(): number`
Returns the current time as a Unix timestamp in seconds (`Math.floor(Date.now() / 1000)`).

#### `formatTimestamp(unixSeconds: number): string`
Formats a Unix timestamp as a human-readable date-time string for display in the UI.
Format: `"Jun 26, 2026 at 14:03"` (locale-aware via `Intl.DateTimeFormat`).

---

## `src/utils/dom.js`

Small DOM utility functions to reduce boilerplate in components.

### Exports

#### `createElement(tag: string, attributes?: object, children?: (HTMLElement | string)[]): HTMLElement`
Creates and returns a DOM element with the given tag, attributes, and children.
- `attributes` keys map to element properties or `setAttribute()` calls.
- `children` are appended in order; strings become `TextNode`s.

#### `clearElement(element: HTMLElement): void`
Removes all child nodes from `element`.

#### `showElement(element: HTMLElement): void`
Removes the `hidden` attribute / `display: none` style from `element`.

#### `hideElement(element: HTMLElement): void`
Adds the `hidden` attribute to `element`.

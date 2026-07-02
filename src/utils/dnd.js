export const DRAGGING_CLASS = 'task-card--dragging'
export const DRAG_OVER_CLASS = 'kanban-column--drag-over'

export function makeDraggable(element, taskId) {
  element.draggable = true

  element.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
    requestAnimationFrame(() => element.classList.add(DRAGGING_CLASS))
  })

  element.addEventListener('dragend', () => {
    element.classList.remove(DRAGGING_CLASS)
  })
}

export function makeDropTarget(element, onDrop) {
  element.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    element.classList.add(DRAG_OVER_CLASS)
  })

  element.addEventListener('dragleave', (e) => {
    if (!element.contains(e.relatedTarget)) {
      element.classList.remove(DRAG_OVER_CLASS)
    }
  })

  element.addEventListener('drop', (e) => {
    e.preventDefault()
    element.classList.remove(DRAG_OVER_CLASS)
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      onDrop(taskId)
    }
  })
}

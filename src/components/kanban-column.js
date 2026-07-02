import { createTaskCard } from './task-card.js'
import { makeDropTarget } from '../utils/dnd.js'

const COLUMN_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

export function createKanbanColumn({ columnKey, tasks, currentUserId, onTaskClick, onDrop }) {
  const col = document.createElement('div')
  col.className = 'kanban-column'
  col.dataset.column = columnKey

  const header = document.createElement('div')
  header.className = 'kanban-column__header'

  const label = document.createElement('span')
  label.className = 'kanban-column__label'
  label.textContent = COLUMN_LABELS[columnKey] ?? columnKey

  const count = document.createElement('span')
  count.className = 'kanban-column__count'
  count.textContent = tasks.length

  header.appendChild(label)
  header.appendChild(count)

  const cards = document.createElement('ul')
  cards.className = 'kanban-column__cards'

  if (tasks.length === 0) {
    const empty = document.createElement('li')
    empty.className = 'kanban-column__empty'
    empty.textContent = 'No tasks yet'
    cards.appendChild(empty)
  } else {
    for (const task of tasks) {
      cards.appendChild(createTaskCard({
        task,
        currentUserId,
        onClick: (id) => onTaskClick(id),
      }))
    }
  }

  col.appendChild(header)
  col.appendChild(cards)

  makeDropTarget(col, (taskId) => onDrop(taskId, columnKey))

  return col
}

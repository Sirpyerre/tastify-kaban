import { makeDraggable } from '../utils/dnd.js'

export function createTaskCard({ task, currentUserId, onClick }) {
  const li = document.createElement('li')

  const btn = document.createElement('button')
  btn.className = 'task-card'
  btn.type = 'button'

  if (task.assignee_id === currentUserId) {
    btn.classList.add('task-card--mine')
  }

  const titleEl = document.createElement('div')
  titleEl.className = 'task-card__title'
  titleEl.textContent = task.title

  const meta = document.createElement('div')
  meta.className = 'task-card__meta'

  const assigneeEl = document.createElement('span')
  assigneeEl.className = 'task-card__assignee'
  assigneeEl.textContent = task.assignee_name ?? 'Unassigned'

  meta.appendChild(assigneeEl)
  btn.appendChild(titleEl)
  btn.appendChild(meta)
  btn.addEventListener('click', () => onClick(task.id))

  makeDraggable(btn, task.id)

  li.appendChild(btn)
  return li
}

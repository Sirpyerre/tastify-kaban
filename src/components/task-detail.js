import { getTask } from '../stores/tasks.js'
import { formatTimestamp } from '../utils/time.js'
import { createCommentList } from './comment-list.js'

const COLUMN_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

export function createTaskDetail({ taskId, currentUserId, onClose }) {
  const task = getTask(taskId)
  if (!task) {
    const err = document.createElement('p')
    err.textContent = 'Task not found.'
    return err
  }

  const container = document.createElement('div')
  container.className = 'task-detail'

  const header = document.createElement('div')
  header.className = 'task-detail__header'

  const title = document.createElement('h2')
  title.className = 'task-detail__title'
  title.textContent = task.title

  const closeBtn = document.createElement('button')
  closeBtn.className = 'btn btn--ghost'
  closeBtn.textContent = '✕'
  closeBtn.setAttribute('aria-label', 'Close task detail')
  closeBtn.addEventListener('click', onClose)

  header.appendChild(title)
  header.appendChild(closeBtn)
  container.appendChild(header)

  const meta = document.createElement('div')
  meta.className = 'task-detail__meta'
  meta.appendChild(buildMetaItem('Assignee', task.assignee_name ?? 'Unassigned'))
  meta.appendChild(buildMetaItem('Status', COLUMN_LABELS[task.column_key] ?? task.column_key))
  meta.appendChild(buildMetaItem('Created', formatTimestamp(task.created_at)))
  container.appendChild(meta)

  const descEl = document.createElement('p')
  if (task.description) {
    descEl.className = 'task-detail__description'
    descEl.textContent = task.description
  } else {
    descEl.className = 'task-detail__description task-detail__description--empty'
    descEl.textContent = 'No description provided.'
  }
  container.appendChild(descEl)

  const divider = document.createElement('hr')
  divider.className = 'task-detail__divider'
  container.appendChild(divider)

  container.appendChild(createCommentList({ taskId, currentUserId }))

  return container
}

function buildMetaItem(label, value) {
  const item = document.createElement('div')
  item.className = 'task-detail__meta-item'

  const lbl = document.createElement('span')
  lbl.className = 'task-detail__meta-label'
  lbl.textContent = label

  const val = document.createElement('span')
  val.className = 'task-detail__meta-value'
  val.textContent = value

  item.appendChild(lbl)
  item.appendChild(val)
  return item
}

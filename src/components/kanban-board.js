import { getProject } from '../stores/projects.js'
import { getTasksByColumn, moveTask } from '../stores/tasks.js'
import { EventBus, BOARD_UPDATED } from '../utils/event-bus.js'
import { openModal, closeModal } from '../utils/modal.js'
import { navigate } from '../utils/router.js'
import { createKanbanColumn } from './kanban-column.js'
import { createTaskForm } from './task-form.js'
import { createMemberManager } from './member-manager.js'
import { createTaskDetail } from './task-detail.js'

const COLUMN_ORDER = ['todo', 'in_progress', 'in_review', 'done']

export function createKanbanBoard({ projectId, currentUserId }) {
  const view = document.createElement('div')
  view.className = 'kanban-view'

  const project = getProject(projectId)

  const boardHeader = buildBoardHeader(project, currentUserId, projectId)
  view.appendChild(boardHeader)

  const columnsContainer = document.createElement('div')
  columnsContainer.className = 'kanban-board__columns'
  view.appendChild(columnsContainer)

  function renderColumns() {
    columnsContainer.innerHTML = ''
    const board = getTasksByColumn(projectId)
    for (const key of COLUMN_ORDER) {
      columnsContainer.appendChild(createKanbanColumn({
        columnKey: key,
        tasks: board[key],
        currentUserId,
        onTaskClick: (taskId) => {
          openModal(createTaskDetail({
            taskId,
            currentUserId,
            onClose: closeModal,
          }))
        },
        onDrop: (taskId, targetColumn) => {
          moveTask(taskId, targetColumn)
        },
      }))
    }
  }

  const handler = (data) => {
    if (!data || data.projectId === projectId) renderColumns()
  }
  EventBus.on(BOARD_UPDATED, handler)

  const addTaskBtn = boardHeader.querySelector('[data-action="add-task"]')
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      openModal(createTaskForm({
        projectId,
        onSubmit: closeModal,
        onCancel: closeModal,
      }))
    })
  }

  const manageMembersBtn = boardHeader.querySelector('[data-action="manage-members"]')
  if (manageMembersBtn) {
    manageMembersBtn.addEventListener('click', () => {
      openModal(createMemberManager({ projectId, onClose: closeModal }))
    })
  }

  const observer = new MutationObserver(() => {
    if (!document.contains(view)) {
      EventBus.off(BOARD_UPDATED, handler)
      observer.disconnect()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  renderColumns()
  return view
}

function buildBoardHeader(project, currentUserId, projectId) {
  const header = document.createElement('div')
  header.className = 'kanban-board-header'

  const back = document.createElement('button')
  back.className = 'btn btn--ghost btn--sm kanban-board-header__back'
  back.textContent = '← Projects'
  back.addEventListener('click', () => navigate('/projects'))

  const title = document.createElement('h2')
  title.className = 'kanban-board-header__title'
  title.textContent = project?.name ?? 'Project'

  const actions = document.createElement('div')
  actions.className = 'kanban-board-header__actions'

  const addTask = document.createElement('button')
  addTask.className = 'btn btn--primary btn--sm'
  addTask.textContent = '+ Add Task'
  addTask.dataset.action = 'add-task'

  const manageMembers = document.createElement('button')
  manageMembers.className = 'btn btn--secondary btn--sm'
  manageMembers.textContent = 'Manage Members'
  manageMembers.dataset.action = 'manage-members'

  actions.appendChild(addTask)
  actions.appendChild(manageMembers)

  header.appendChild(back)
  header.appendChild(title)
  header.appendChild(actions)
  return header
}

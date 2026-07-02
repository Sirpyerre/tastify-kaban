import { getMembers } from '../stores/projects.js'
import { createTask } from '../stores/tasks.js'

export function createTaskForm({ projectId, onSubmit, onCancel }) {
  const form = document.createElement('form')
  form.className = 'task-form'
  form.noValidate = true

  const title = document.createElement('h2')
  title.className = 'task-form__title'
  title.textContent = 'Add Task'
  form.appendChild(title)

  // Title field
  const titleGroup = buildFormGroup('task-title-input', 'Title', true)
  const titleInput = document.createElement('input')
  titleInput.id = 'task-title-input'
  titleInput.type = 'text'
  titleInput.placeholder = 'Task title'
  titleInput.required = true
  titleGroup.appendChild(titleInput)

  const titleError = document.createElement('span')
  titleError.className = 'form-error'
  titleError.setAttribute('hidden', '')
  titleError.textContent = 'Title cannot be empty'
  titleGroup.appendChild(titleError)
  form.appendChild(titleGroup)

  // Description field
  const descGroup = buildFormGroup('task-desc-input', 'Description (optional)', false)
  const descInput = document.createElement('textarea')
  descInput.id = 'task-desc-input'
  descInput.placeholder = 'Optional details…'
  descGroup.appendChild(descInput)
  form.appendChild(descGroup)

  // Assignee field
  const assigneeGroup = buildFormGroup('task-assignee-select', 'Assignee (optional)', false)
  const select = document.createElement('select')
  select.id = 'task-assignee-select'

  const unassigned = document.createElement('option')
  unassigned.value = ''
  unassigned.textContent = 'Unassigned'
  select.appendChild(unassigned)

  for (const member of getMembers(projectId)) {
    const opt = document.createElement('option')
    opt.value = member.id
    opt.textContent = member.name
    select.appendChild(opt)
  }

  assigneeGroup.appendChild(select)
  form.appendChild(assigneeGroup)

  // Actions
  const actions = document.createElement('div')
  actions.className = 'form-actions'

  const cancelBtn = document.createElement('button')
  cancelBtn.type = 'button'
  cancelBtn.className = 'btn btn--secondary'
  cancelBtn.textContent = 'Cancel'
  cancelBtn.addEventListener('click', onCancel)

  const submitBtn = document.createElement('button')
  submitBtn.type = 'submit'
  submitBtn.className = 'btn btn--primary'
  submitBtn.textContent = 'Create Task'
  submitBtn.disabled = true

  titleInput.addEventListener('input', () => {
    submitBtn.disabled = !titleInput.value.trim()
    titleError.setAttribute('hidden', '')
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const taskTitle = titleInput.value.trim()
    if (!taskTitle) {
      titleError.removeAttribute('hidden')
      titleInput.focus()
      return
    }
    createTask(projectId, taskTitle, {
      description: descInput.value.trim() || null,
      assigneeId: select.value || null,
    })
    onSubmit()
  })

  actions.appendChild(cancelBtn)
  actions.appendChild(submitBtn)
  form.appendChild(actions)

  requestAnimationFrame(() => titleInput.focus())
  return form
}

function buildFormGroup(id, labelText, required) {
  const group = document.createElement('div')
  group.className = 'form-group'

  const label = document.createElement('label')
  label.className = 'form-label'
  label.setAttribute('for', id)
  label.textContent = required ? labelText : labelText

  group.appendChild(label)
  return group
}

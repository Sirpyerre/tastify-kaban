export function createProjectForm({ onSubmit, onCancel }) {
  const form = document.createElement('form')
  form.className = 'project-form'
  form.noValidate = true

  const title = document.createElement('h2')
  title.className = 'project-form__title'
  title.textContent = 'New Project'
  form.appendChild(title)

  const group = document.createElement('div')
  group.className = 'form-group'

  const label = document.createElement('label')
  label.className = 'form-label'
  label.textContent = 'Project name'
  label.setAttribute('for', 'project-name-input')

  const input = document.createElement('input')
  input.id = 'project-name-input'
  input.type = 'text'
  input.placeholder = 'e.g. Mobile App Redesign'
  input.autocomplete = 'off'
  input.required = true

  const error = document.createElement('span')
  error.className = 'form-error'
  error.setAttribute('hidden', '')
  error.textContent = 'Project name cannot be empty'

  group.appendChild(label)
  group.appendChild(input)
  group.appendChild(error)
  form.appendChild(group)

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
  submitBtn.textContent = 'Create Project'
  submitBtn.disabled = true

  input.addEventListener('input', () => {
    submitBtn.disabled = !input.value.trim()
    error.setAttribute('hidden', '')
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const name = input.value.trim()
    if (!name) {
      error.removeAttribute('hidden')
      input.focus()
      return
    }
    onSubmit(name)
  })

  actions.appendChild(cancelBtn)
  actions.appendChild(submitBtn)
  form.appendChild(actions)

  requestAnimationFrame(() => input.focus())
  return form
}

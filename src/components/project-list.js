import { getProjectsForUser } from '../stores/projects.js'
import { EventBus, PROJECT_LIST_UPDATED } from '../utils/event-bus.js'
import { openModal, closeModal } from '../utils/modal.js'
import { createProjectForm } from './project-form.js'
import { createProject, addMember } from '../stores/projects.js'
import { navigate } from '../utils/router.js'

export function createProjectList({ userId, onSelectProject }) {
  const view = document.createElement('div')
  view.className = 'project-list-view'

  function render() {
    view.innerHTML = ''

    const body = document.createElement('div')
    body.className = 'project-list-view__body'

    const hdr = document.createElement('div')
    hdr.className = 'project-list-view__header'

    const title = document.createElement('h2')
    title.className = 'project-list-view__title'
    title.textContent = 'Your Projects'

    const newBtn = document.createElement('button')
    newBtn.className = 'btn btn--primary'
    newBtn.textContent = '+ New Project'
    newBtn.addEventListener('click', openCreateForm)

    hdr.appendChild(title)
    hdr.appendChild(newBtn)
    body.appendChild(hdr)

    const projects = getProjectsForUser(userId)

    if (projects.length === 0) {
      const empty = document.createElement('div')
      empty.className = 'project-list__empty'
      const msg = document.createElement('p')
      msg.textContent = 'No projects yet.'
      const hint = document.createElement('p')
      hint.textContent = 'Create your first project to get started.'
      empty.appendChild(msg)
      empty.appendChild(hint)
      body.appendChild(empty)
    } else {
      const list = document.createElement('ul')
      list.className = 'project-list'
      for (const project of projects) {
        list.appendChild(buildProjectCard(project, onSelectProject))
      }
      body.appendChild(list)
    }

    view.appendChild(body)
  }

  function openCreateForm() {
    openModal(createProjectForm({
      onSubmit(name) {
        const project = createProject(name)
        addMember(project.id, userId)
        closeModal()
        navigate(`/projects/${project.id}`)
      },
      onCancel: closeModal,
    }))
  }

  const handler = () => render()
  EventBus.on(PROJECT_LIST_UPDATED, handler)

  render()

  const observer = new MutationObserver(() => {
    if (!document.contains(view)) {
      EventBus.off(PROJECT_LIST_UPDATED, handler)
      observer.disconnect()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  return view
}

function buildProjectCard(project, onSelect) {
  const li = document.createElement('li')

  const btn = document.createElement('button')
  btn.className = 'project-card'
  btn.setAttribute('aria-label', `Open project: ${project.name}`)

  const info = document.createElement('div')

  const name = document.createElement('div')
  name.className = 'project-card__name'
  name.textContent = project.name

  const meta = document.createElement('div')
  meta.className = 'project-card__meta'
  const date = new Date(project.created_at * 1000)
  meta.textContent = `Created ${date.toLocaleDateString()}`

  const arrow = document.createElement('span')
  arrow.className = 'project-card__arrow'
  arrow.textContent = '›'
  arrow.setAttribute('aria-hidden', 'true')

  info.appendChild(name)
  info.appendChild(meta)
  btn.appendChild(info)
  btn.appendChild(arrow)
  btn.addEventListener('click', () => onSelect(project.id))

  li.appendChild(btn)
  return li
}

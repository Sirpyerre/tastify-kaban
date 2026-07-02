import { onRoute, navigate, start, setGuard } from '../utils/router.js'
import { getCurrentUser, setCurrentUser, clearCurrentUser } from '../stores/users.js'
import { createProfileSelector } from './profile-selector.js'
import { createProjectList } from './project-list.js'
import { createKanbanBoard } from './kanban-board.js'

export function createApp() {
  const root = document.createElement('div')
  root.style.cssText = 'display:flex;flex-direction:column;height:100%'

  const header = buildHeader()
  const viewContainer = document.createElement('main')
  viewContainer.style.cssText = 'flex:1;overflow:hidden;display:flex;flex-direction:column'

  root.appendChild(header)
  root.appendChild(viewContainer)

  function mount(component) {
    viewContainer.innerHTML = ''
    viewContainer.appendChild(component)
  }

  function updateHeader(user) {
    const userEl = header.querySelector('.app-header__user')
    if (user) {
      userEl.innerHTML = ''
      const name = document.createElement('span')
      name.textContent = user.name
      const btn = document.createElement('button')
      btn.className = 'btn btn--ghost btn--sm'
      btn.textContent = 'Switch Profile'
      btn.addEventListener('click', () => {
        clearCurrentUser()
        navigate('/')
      })
      userEl.appendChild(name)
      userEl.appendChild(btn)
      header.removeAttribute('hidden')
    } else {
      header.setAttribute('hidden', '')
    }
  }

  setGuard((hash) => {
    if (hash !== '/' && !getCurrentUser()) {
      navigate('/')
      return false
    }
    return true
  })

  onRoute('/', () => {
    updateHeader(null)
    mount(createProfileSelector({
      onSelect(user) {
        setCurrentUser(user.id)
        navigate('/projects')
      },
    }))
  })

  onRoute('/projects', () => {
    const user = getCurrentUser()
    updateHeader(user)
    mount(createProjectList({
      userId: user.id,
      onSelectProject: (id) => navigate(`/projects/${id}`),
      onCreateProject: () => navigate('/projects'),
    }))
  })

  onRoute('/projects/:id', ({ id }) => {
    const user = getCurrentUser()
    updateHeader(user)
    mount(createKanbanBoard({ projectId: id, currentUserId: user.id }))
  })

  start()
  return root
}

function buildHeader() {
  const header = document.createElement('header')
  header.className = 'app-header'
  header.setAttribute('hidden', '')

  const logo = document.createElement('span')
  logo.className = 'app-header__logo'
  logo.textContent = 'Taskify'

  const spacer = document.createElement('div')
  spacer.className = 'app-header__spacer'

  const userEl = document.createElement('div')
  userEl.className = 'app-header__user'

  header.appendChild(logo)
  header.appendChild(spacer)
  header.appendChild(userEl)
  return header
}

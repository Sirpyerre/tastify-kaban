import { getAllUsers } from '../stores/users.js'
import { getMembers, addMember, removeMember } from '../stores/projects.js'

export function createMemberManager({ projectId, onClose }) {
  const container = document.createElement('div')
  container.className = 'member-manager'

  function render() {
    container.innerHTML = ''

    const header = document.createElement('div')
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between'

    const title = document.createElement('h2')
    title.className = 'member-manager__title'
    title.textContent = 'Manage Members'

    const closeBtn = document.createElement('button')
    closeBtn.className = 'btn btn--ghost'
    closeBtn.textContent = '✕'
    closeBtn.setAttribute('aria-label', 'Close')
    closeBtn.addEventListener('click', onClose)

    header.appendChild(title)
    header.appendChild(closeBtn)
    container.appendChild(header)

    const members = getMembers(projectId)
    const memberIds = new Set(members.map(m => m.id))
    const allUsers = getAllUsers()
    const available = allUsers.filter(u => !memberIds.has(u.id))

    if (members.length > 0) {
      const label = document.createElement('p')
      label.className = 'member-manager__section-label'
      label.textContent = 'Current Members'
      container.appendChild(label)

      const list = document.createElement('ul')
      list.className = 'member-list'
      for (const user of members) {
        list.appendChild(buildMemberItem(user, 'Remove', () => {
          removeMember(projectId, user.id)
          render()
        }))
      }
      container.appendChild(list)
    }

    if (available.length > 0) {
      const label = document.createElement('p')
      label.className = 'member-manager__section-label'
      label.textContent = 'Add Members'
      container.appendChild(label)

      const list = document.createElement('ul')
      list.className = 'member-list'
      for (const user of available) {
        list.appendChild(buildMemberItem(user, 'Add', () => {
          addMember(projectId, user.id)
          render()
        }))
      }
      container.appendChild(list)
    }

    if (members.length === 0 && available.length === 0) {
      const empty = document.createElement('p')
      empty.className = 'member-manager__empty'
      empty.textContent = 'No users available.'
      container.appendChild(empty)
    }
  }

  render()
  return container
}

function buildMemberItem(user, actionLabel, onAction) {
  const li = document.createElement('li')
  li.className = 'member-item'

  const avatar = document.createElement('div')
  avatar.className = 'member-item__avatar'
  avatar.textContent = user.initials
  avatar.setAttribute('aria-hidden', 'true')

  const info = document.createElement('div')

  const name = document.createElement('div')
  name.className = 'member-item__name'
  name.textContent = user.name

  const role = document.createElement('div')
  role.className = 'member-item__role'
  role.textContent = user.role === 'product_manager' ? 'Product Manager' : 'Engineer'

  info.appendChild(name)
  info.appendChild(role)

  const btn = document.createElement('button')
  btn.className = `btn btn--sm member-item__action ${actionLabel === 'Remove' ? 'btn--danger' : 'btn--secondary'}`
  btn.textContent = actionLabel
  btn.addEventListener('click', onAction)

  li.appendChild(avatar)
  li.appendChild(info)
  li.appendChild(btn)
  return li
}

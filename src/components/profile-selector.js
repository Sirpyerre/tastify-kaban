import { getAllUsers } from '../stores/users.js'

export function createProfileSelector({ onSelect }) {
  const section = document.createElement('section')
  section.className = 'profile-selector'

  const title = document.createElement('h1')
  title.className = 'profile-selector__title'
  title.textContent = 'Welcome to Taskify'

  const subtitle = document.createElement('p')
  subtitle.className = 'profile-selector__subtitle'
  subtitle.textContent = 'Choose your profile to get started'

  const grid = document.createElement('div')
  grid.className = 'profile-selector__grid'

  for (const user of getAllUsers()) {
    const card = buildCard(user, onSelect)
    grid.appendChild(card)
  }

  section.appendChild(title)
  section.appendChild(subtitle)
  section.appendChild(grid)
  return section
}

function buildCard(user, onSelect) {
  const btn = document.createElement('button')
  btn.className = 'profile-card'
  btn.type = 'button'
  btn.setAttribute('aria-label', `Select profile: ${user.name}`)

  const avatar = document.createElement('div')
  avatar.className = 'profile-card__avatar'
  avatar.textContent = user.initials
  avatar.setAttribute('aria-hidden', 'true')

  const name = document.createElement('span')
  name.className = 'profile-card__name'
  name.textContent = user.name

  const role = document.createElement('span')
  role.className = `profile-card__role profile-card__role--${user.role}`
  role.textContent = user.role === 'product_manager' ? 'Product Manager' : 'Engineer'

  btn.appendChild(avatar)
  btn.appendChild(name)
  btn.appendChild(role)

  btn.addEventListener('click', () => onSelect(user))
  return btn
}

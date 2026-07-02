import { initDatabase } from './db/database.js'
import { createLoadingScreen } from './components/loading-screen.js'
import { createApp } from './components/app.js'

const appEl = document.getElementById('app')

const loading = createLoadingScreen()
appEl.appendChild(loading)

initDatabase()
  .then(() => {
    appEl.removeChild(loading)
    appEl.appendChild(createApp())
  })
  .catch((err) => {
    console.error('[Taskify] Failed to initialize database:', err)
    appEl.removeChild(loading)

    const errorScreen = document.createElement('div')
    errorScreen.className = 'error-screen'

    const title = document.createElement('h1')
    title.className = 'error-screen__title'
    title.textContent = 'Taskify could not start'

    const msg = document.createElement('p')
    msg.className = 'error-screen__message'
    msg.textContent =
      'Your browser may not support OPFS storage, which is required for Taskify. ' +
      'Please try Chrome 120+, Firefox 120+, or Safari 17+.'

    errorScreen.appendChild(title)
    errorScreen.appendChild(msg)
    appEl.appendChild(errorScreen)
  })

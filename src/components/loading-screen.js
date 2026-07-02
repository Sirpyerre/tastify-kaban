export function createLoadingScreen() {
  const el = document.createElement('div')
  el.className = 'loading-screen'

  const spinner = document.createElement('div')
  spinner.className = 'loading-screen__spinner'
  spinner.setAttribute('aria-hidden', 'true')

  const text = document.createElement('p')
  text.className = 'loading-screen__text'
  text.textContent = 'Loading Taskify…'

  el.appendChild(spinner)
  el.appendChild(text)
  return el
}

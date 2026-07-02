const routes = []
let guardFn = null

export function setGuard(fn) {
  guardFn = fn
}

export function onRoute(pattern, handler) {
  const paramNames = []
  const regexStr = pattern.replace(/:([a-zA-Z]+)/g, (_, name) => {
    paramNames.push(name)
    return '([^/]+)'
  })
  routes.push({ regex: new RegExp(`^${regexStr}$`), paramNames, handler })
}

export function navigate(path) {
  window.location.hash = '#' + path
}

function dispatch() {
  const hash = window.location.hash.slice(1) || '/'

  if (guardFn && !guardFn(hash)) {
    return
  }

  for (const { regex, paramNames, handler } of routes) {
    const match = hash.match(regex)
    if (match) {
      const params = {}
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1]
      })
      handler(params)
      return
    }
  }
}

export function start() {
  window.addEventListener('hashchange', dispatch)
  dispatch()
}

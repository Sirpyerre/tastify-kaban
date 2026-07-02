export function createElement(tag, attributes = {}, children = []) {
  const el = document.createElement(tag)
  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'className') {
      el.className = value
    } else if (key in el) {
      el[key] = value
    } else {
      el.setAttribute(key, value)
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child))
    } else if (child instanceof Node) {
      el.appendChild(child)
    }
  }
  return el
}

export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

export function showElement(element) {
  element.removeAttribute('hidden')
}

export function hideElement(element) {
  element.setAttribute('hidden', '')
}

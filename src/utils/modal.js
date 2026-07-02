let overlay = null

export function openModal(contentElement) {
  closeModal()

  overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')

  const dialog = document.createElement('div')
  dialog.className = 'modal-dialog'
  dialog.appendChild(contentElement)

  overlay.appendChild(dialog)
  document.body.appendChild(overlay)

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal()
  })

  document.addEventListener('keydown', handleEscape)

  const firstFocusable = dialog.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  firstFocusable?.focus()
}

export function closeModal() {
  if (overlay) {
    document.removeEventListener('keydown', handleEscape)
    overlay.remove()
    overlay = null
  }
}

function handleEscape(e) {
  if (e.key === 'Escape') closeModal()
}

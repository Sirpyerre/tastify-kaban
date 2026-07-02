import { getComments, addComment, editComment, deleteComment, canModifyComment } from '../stores/comments.js'
import { EventBus, COMMENT_UPDATED } from '../utils/event-bus.js'
import { formatTimestamp } from '../utils/time.js'

export function createCommentList({ taskId, currentUserId }) {
  const container = document.createElement('div')
  container.className = 'comment-list'

  const heading = document.createElement('h3')
  heading.className = 'comment-list__title'
  heading.textContent = 'Comments'
  container.appendChild(heading)

  const itemsEl = document.createElement('ul')
  itemsEl.className = 'comment-list__items'
  container.appendChild(itemsEl)

  const commentForm = buildCommentForm(taskId, currentUserId)
  container.appendChild(commentForm)

  function renderComments() {
    itemsEl.innerHTML = ''
    const comments = getComments(taskId)

    if (comments.length === 0) {
      const empty = document.createElement('li')
      empty.className = 'comment-list__empty'
      empty.textContent = 'No comments yet. Be the first to comment!'
      itemsEl.appendChild(empty)
      return
    }

    for (const comment of comments) {
      itemsEl.appendChild(buildCommentItem(comment, currentUserId, taskId, renderComments))
    }
  }

  const handler = (data) => {
    if (!data || data.taskId === taskId) renderComments()
  }
  EventBus.on(COMMENT_UPDATED, handler)

  const observer = new MutationObserver(() => {
    if (!document.contains(container)) {
      EventBus.off(COMMENT_UPDATED, handler)
      observer.disconnect()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  renderComments()
  return container
}

function buildCommentItem(comment, currentUserId, taskId, onRefresh) {
  const li = document.createElement('li')
  li.className = 'comment'

  function showNormal() {
    li.innerHTML = ''

    const header = document.createElement('div')
    header.className = 'comment__header'

    const author = document.createElement('span')
    author.className = 'comment__author'
    author.textContent = comment.author_name ?? comment.author_id

    const time = document.createElement('span')
    time.className = 'comment__timestamp'
    time.textContent = formatTimestamp(comment.created_at)

    header.appendChild(author)
    header.appendChild(time)

    if (canModifyComment(comment, currentUserId)) {
      const actions = document.createElement('div')
      actions.className = 'comment__actions'

      const editBtn = document.createElement('button')
      editBtn.className = 'btn btn--sm btn--ghost'
      editBtn.textContent = 'Edit'
      editBtn.addEventListener('click', showEditMode)

      const delBtn = document.createElement('button')
      delBtn.className = 'btn btn--sm btn--danger'
      delBtn.textContent = 'Delete'
      delBtn.addEventListener('click', () => {
        deleteComment(comment.id, currentUserId)
      })

      actions.appendChild(editBtn)
      actions.appendChild(delBtn)
      header.appendChild(actions)
    }

    const body = document.createElement('p')
    body.className = 'comment__body'
    body.textContent = comment.body

    li.appendChild(header)
    li.appendChild(body)
  }

  function showEditMode() {
    li.innerHTML = ''

    const group = document.createElement('div')
    group.className = 'form-group'

    const textarea = document.createElement('textarea')
    textarea.value = comment.body

    const errorEl = document.createElement('span')
    errorEl.className = 'form-error'
    errorEl.setAttribute('hidden', '')
    errorEl.textContent = 'Comment cannot be empty'

    group.appendChild(textarea)
    group.appendChild(errorEl)

    const actions = document.createElement('div')
    actions.className = 'comment-form__actions'

    const saveBtn = document.createElement('button')
    saveBtn.className = 'btn btn--primary btn--sm'
    saveBtn.textContent = 'Save'
    saveBtn.addEventListener('click', () => {
      const text = textarea.value.trim()
      if (!text) {
        errorEl.removeAttribute('hidden')
        textarea.focus()
        return
      }
      editComment(comment.id, currentUserId, text)
    })

    const cancelBtn = document.createElement('button')
    cancelBtn.className = 'btn btn--secondary btn--sm'
    cancelBtn.textContent = 'Cancel'
    cancelBtn.addEventListener('click', showNormal)

    actions.appendChild(cancelBtn)
    actions.appendChild(saveBtn)
    li.appendChild(group)
    li.appendChild(actions)

    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    })
  }

  showNormal()
  return li
}

function buildCommentForm(taskId, currentUserId) {
  const form = document.createElement('form')
  form.className = 'comment-form'
  form.noValidate = true

  const textarea = document.createElement('textarea')
  textarea.placeholder = 'Write a comment…'
  textarea.rows = 2

  const errorEl = document.createElement('span')
  errorEl.className = 'form-error'
  errorEl.setAttribute('hidden', '')
  errorEl.textContent = 'Comment cannot be empty'

  const actions = document.createElement('div')
  actions.className = 'comment-form__actions'

  const submitBtn = document.createElement('button')
  submitBtn.type = 'submit'
  submitBtn.className = 'btn btn--primary btn--sm'
  submitBtn.textContent = 'Add Comment'

  textarea.addEventListener('input', () => {
    errorEl.setAttribute('hidden', '')
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const body = textarea.value.trim()
    if (!body) {
      errorEl.removeAttribute('hidden')
      textarea.focus()
      return
    }
    addComment(taskId, currentUserId, body)
    textarea.value = ''
  })

  actions.appendChild(submitBtn)
  form.appendChild(textarea)
  form.appendChild(errorEl)
  form.appendChild(actions)
  return form
}

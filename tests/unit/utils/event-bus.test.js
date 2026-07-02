import { describe, it, expect, vi } from 'vitest'
import { EventBus, BOARD_UPDATED, PROJECT_LIST_UPDATED, COMMENT_UPDATED } from '../../../src/utils/event-bus.js'

describe('EventBus', () => {
  it('calls registered handler when event is emitted', () => {
    const handler = vi.fn()
    EventBus.on(BOARD_UPDATED, handler)
    EventBus.emit(BOARD_UPDATED, { projectId: 'p1' })
    expect(handler).toHaveBeenCalledWith({ projectId: 'p1' })
    EventBus.off(BOARD_UPDATED, handler)
  })

  it('does not call handler after off()', () => {
    const handler = vi.fn()
    EventBus.on(PROJECT_LIST_UPDATED, handler)
    EventBus.off(PROJECT_LIST_UPDATED, handler)
    EventBus.emit(PROJECT_LIST_UPDATED)
    expect(handler).not.toHaveBeenCalled()
  })

  it('calls multiple handlers for the same event', () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    EventBus.on(COMMENT_UPDATED, h1)
    EventBus.on(COMMENT_UPDATED, h2)
    EventBus.emit(COMMENT_UPDATED, { taskId: 't1' })
    expect(h1).toHaveBeenCalled()
    expect(h2).toHaveBeenCalled()
    EventBus.off(COMMENT_UPDATED, h1)
    EventBus.off(COMMENT_UPDATED, h2)
  })

  it('emitting with no listeners does not throw', () => {
    expect(() => EventBus.emit('no-such-event')).not.toThrow()
  })

  it('off() for unregistered handler does not throw', () => {
    expect(() => EventBus.off('no-such-event', vi.fn())).not.toThrow()
  })

  it('exports correct event name constants', () => {
    expect(BOARD_UPDATED).toBe('board-updated')
    expect(PROJECT_LIST_UPDATED).toBe('project-list-updated')
    expect(COMMENT_UPDATED).toBe('comment-updated')
  })
})

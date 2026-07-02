// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('router', () => {
  let router

  beforeEach(async () => {
    vi.resetModules()
    window.location.hash = ''
    router = await import('../../../src/utils/router.js')
  })

  it('onRoute + start calls handler for matching hash', () => {
    const handler = vi.fn()
    router.onRoute('/test', handler)
    window.location.hash = '#/test'
    router.start()
    expect(handler).toHaveBeenCalled()
  })

  it('onRoute extracts named params from URL', () => {
    let captured = null
    router.onRoute('/projects/:id', (params) => { captured = params })
    window.location.hash = '#/projects/abc-123'
    router.start()
    expect(captured).toEqual({ id: 'abc-123' })
  })

  it('navigate sets window.location.hash', () => {
    router.navigate('/dashboard')
    expect(window.location.hash).toBe('#/dashboard')
  })

  it('unmatched route does not call any handler', () => {
    const handler = vi.fn()
    router.onRoute('/known', handler)
    window.location.hash = '#/unknown'
    router.start()
    expect(handler).not.toHaveBeenCalled()
  })

  it('setGuard blocks navigation when it returns false', () => {
    const handler = vi.fn()
    router.setGuard(() => false)
    router.onRoute('/guarded', handler)
    window.location.hash = '#/guarded'
    router.start()
    expect(handler).not.toHaveBeenCalled()
  })

  it('setGuard allows navigation when it returns true', () => {
    const handler = vi.fn()
    router.setGuard(() => true)
    router.onRoute('/allowed', handler)
    window.location.hash = '#/allowed'
    router.start()
    expect(handler).toHaveBeenCalled()
  })
})

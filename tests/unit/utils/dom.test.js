// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { createElement, clearElement, showElement, hideElement } from '../../../src/utils/dom.js'

describe('createElement', () => {
  it('creates an element with the given tag', () => {
    const el = createElement('div')
    expect(el.tagName).toBe('DIV')
  })

  it('sets className via className attribute', () => {
    const el = createElement('span', { className: 'foo bar' })
    expect(el.className).toBe('foo bar')
  })

  it('sets arbitrary attributes', () => {
    const el = createElement('input', { type: 'text' })
    expect(el.type).toBe('text')
  })

  it('appends string children as text nodes', () => {
    const el = createElement('p', {}, ['hello'])
    expect(el.textContent).toBe('hello')
  })

  it('appends HTMLElement children', () => {
    const child = document.createElement('span')
    const el = createElement('div', {}, [child])
    expect(el.children[0].tagName).toBe('SPAN')
  })

  it('ignores non-string, non-Node children', () => {
    const el = createElement('div', {}, [42])
    expect(el.childNodes.length).toBe(0)
  })
})

describe('clearElement', () => {
  it('removes all children', () => {
    const el = document.createElement('div')
    el.innerHTML = '<span></span><p></p>'
    clearElement(el)
    expect(el.childNodes.length).toBe(0)
  })
})

describe('showElement', () => {
  it('removes the hidden attribute', () => {
    const el = document.createElement('div')
    el.setAttribute('hidden', '')
    showElement(el)
    expect(el.hasAttribute('hidden')).toBe(false)
  })
})

describe('hideElement', () => {
  it('adds the hidden attribute', () => {
    const el = document.createElement('div')
    hideElement(el)
    expect(el.hasAttribute('hidden')).toBe(true)
  })
})

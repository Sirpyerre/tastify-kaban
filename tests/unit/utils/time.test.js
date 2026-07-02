import { describe, it, expect } from 'vitest'
import { nowUnix, formatTimestamp } from '../../../src/utils/time.js'

describe('nowUnix', () => {
  it('returns an integer', () => {
    expect(Number.isInteger(nowUnix())).toBe(true)
  })

  it('returns a value close to Date.now() / 1000', () => {
    const expected = Math.floor(Date.now() / 1000)
    const actual = nowUnix()
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1)
  })
})

describe('formatTimestamp', () => {
  it('returns a non-empty string', () => {
    expect(typeof formatTimestamp(1719360000)).toBe('string')
    expect(formatTimestamp(1719360000).length).toBeGreaterThan(0)
  })

  it('formats epoch 0 without throwing', () => {
    expect(() => formatTimestamp(0)).not.toThrow()
  })

  it('includes year in output', () => {
    const result = formatTimestamp(1719360000)
    expect(result).toMatch(/202[0-9]/)
  })
})

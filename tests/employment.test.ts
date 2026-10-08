import { describe, expect, it } from 'vitest'
import { category, MAX, MIN, year } from '../src/models/employment'

describe('employment model contract', () => {
  it('constrains the visual domain without rewriting source dates', () => {
    expect(MIN).toBe(1965)
    expect(MAX).toBe(1986)
    expect(year('1988-12-31')).toBe(1988)
    expect(year(null)).toBeNull()
  })
  it('recognises role families without inferring transitions', () => {
    expect(category('Departmental Secretary')).toBe('Administration')
    expect(category('Research Fellow')).toBe('Research')
    expect(category('Tutor DEU')).toBe('Teaching')
    expect(category('Computer programmer')).toBe('Technical')
  })
})

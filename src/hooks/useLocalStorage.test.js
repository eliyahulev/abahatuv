import { describe, it, expect } from 'vitest'
import { daysBetween, startsInLabel, todayKey } from './useLocalStorage'

describe('daysBetween', () => {
  it('returns 0 when "from" is the same calendar day as "to"', () => {
    const to = new Date('2026-04-30T15:00:00')
    expect(daysBetween('2026-04-30', to)).toBe(0)
  })

  it('returns 0 even when the times within the day differ widely', () => {
    // The function should normalize both ends to midnight before subtracting.
    const earlyTo = new Date('2026-04-30T00:30:00')
    const lateTo = new Date('2026-04-30T23:30:00')
    expect(daysBetween('2026-04-30', earlyTo)).toBe(0)
    expect(daysBetween('2026-04-30', lateTo)).toBe(0)
  })

  it('counts whole days for past start dates', () => {
    const to = new Date('2026-04-30T08:00:00')
    expect(daysBetween('2026-04-29', to)).toBe(1)
    expect(daysBetween('2026-04-23', to)).toBe(7) // exactly one week
    expect(daysBetween('2026-04-01', to)).toBe(29)
  })

  it('returns negative numbers for future start dates', () => {
    const to = new Date('2026-04-30T08:00:00')
    expect(daysBetween('2026-05-01', to)).toBe(-1)
    expect(daysBetween('2026-05-07', to)).toBe(-7)
  })

  it('returns 0 when "from" is null/undefined', () => {
    expect(daysBetween(null)).toBe(0)
    expect(daysBetween(undefined)).toBe(0)
    expect(daysBetween('')).toBe(0)
  })
})

describe('startsInLabel', () => {
  it('says "today" for 0 or negative days', () => {
    expect(startsInLabel(0)).toBe('מתחיל היום')
    expect(startsInLabel(-3)).toBe('מתחיל היום')
  })

  it('says "tomorrow" for exactly 1 day', () => {
    expect(startsInLabel(1)).toBe('מתחיל מחר')
  })

  it('uses the dual form for 2 days', () => {
    // Hebrew has a special word for "two days" (יומיים) that we render
    // instead of the numeric form.
    expect(startsInLabel(2)).toBe('מתחיל בעוד יומיים')
  })

  it('uses the numeric form for 3+ days', () => {
    expect(startsInLabel(3)).toBe('מתחיל בעוד 3 ימים')
    expect(startsInLabel(14)).toBe('מתחיל בעוד 14 ימים')
  })
})

describe('todayKey', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

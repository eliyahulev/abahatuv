import { describe, it, expect } from 'vitest'
import { getProgramProgress } from './programProgress'

const apr30 = new Date('2026-04-30T10:00:00')

describe('getProgramProgress — no start date set', () => {
  it('returns the empty pre-start shape', () => {
    expect(getProgramProgress(null, apr30)).toEqual({
      hasStarted: false,
      daysIn: 0,
      daysUntilStart: 0,
      currentWeek: 0,
      dayOfWeek: 1
    })
    expect(getProgramProgress(undefined, apr30).hasStarted).toBe(false)
    expect(getProgramProgress('', apr30).hasStarted).toBe(false)
  })
})

describe('getProgramProgress — start date in the future', () => {
  it('reports daysUntilStart and keeps currentWeek at 0', () => {
    const p = getProgramProgress('2026-05-05', apr30)
    expect(p.hasStarted).toBe(false)
    expect(p.daysIn).toBe(0)
    expect(p.daysUntilStart).toBe(5)
    expect(p.currentWeek).toBe(0)
    expect(p.dayOfWeek).toBe(1)
  })

  it('the day before start: daysUntilStart === 1', () => {
    const p = getProgramProgress('2026-05-01', apr30)
    expect(p.hasStarted).toBe(false)
    expect(p.daysUntilStart).toBe(1)
    expect(p.currentWeek).toBe(0)
  })
})

describe('getProgramProgress — once the user has started', () => {
  it('day 1 of week 1 when startDate === today', () => {
    const p = getProgramProgress('2026-04-30', apr30)
    expect(p.hasStarted).toBe(true)
    expect(p.daysIn).toBe(0)
    expect(p.daysUntilStart).toBe(0)
    expect(p.currentWeek).toBe(1)
    expect(p.dayOfWeek).toBe(1)
  })

  it('day 7 of week 1 (rolls to week 2 the next day)', () => {
    const p = getProgramProgress('2026-04-24', apr30)
    expect(p.daysIn).toBe(6)
    expect(p.currentWeek).toBe(1)
    expect(p.dayOfWeek).toBe(7)
  })

  it('day 1 of week 2 when exactly 7 days in', () => {
    const p = getProgramProgress('2026-04-23', apr30)
    expect(p.daysIn).toBe(7)
    expect(p.currentWeek).toBe(2)
    expect(p.dayOfWeek).toBe(1)
  })

  it('caps currentWeek at 8 even after the program ends', () => {
    // 100 days in, way past week 8.
    const startDate = '2026-01-20'
    const p = getProgramProgress(startDate, apr30)
    expect(p.daysIn).toBe(100)
    expect(p.currentWeek).toBe(8)
  })

  it('day 1 of week 8 is exactly 49 days in', () => {
    const startDate = '2026-03-12' // 49 days before apr30
    const p = getProgramProgress(startDate, apr30)
    expect(p.daysIn).toBe(49)
    expect(p.currentWeek).toBe(8)
    expect(p.dayOfWeek).toBe(1)
  })

  it('rolls to the next day at 20:00 local (4 hours before midnight)', () => {
    const startDate = '2026-04-24'
    // 19:59 local on day 6 -> still day 6 (week 1, day 7)
    const justBefore = getProgramProgress(startDate, new Date('2026-04-30T19:59:00'))
    expect(justBefore.daysIn).toBe(6)
    expect(justBefore.currentWeek).toBe(1)
    expect(justBefore.dayOfWeek).toBe(7)

    // 20:00 local on day 6 -> already day 7 (week 2, day 1)
    const atRollover = getProgramProgress(startDate, new Date('2026-04-30T20:00:00'))
    expect(atRollover.daysIn).toBe(7)
    expect(atRollover.currentWeek).toBe(2)
    expect(atRollover.dayOfWeek).toBe(1)
  })
})

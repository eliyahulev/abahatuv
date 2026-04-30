import { describe, it, expect } from 'vitest'
import { getStreak } from './waterStreak'

const today = new Date('2026-04-30T10:00:00')
const GOAL = 8

describe('getStreak', () => {
  it('is 0 for an empty log', () => {
    expect(getStreak({}, GOAL, today)).toBe(0)
  })

  it('counts a single day at goal', () => {
    expect(getStreak({ '2026-04-30': 8 }, GOAL, today)).toBe(1)
  })

  it('counts consecutive days backwards from today', () => {
    const log = {
      '2026-04-30': 8,
      '2026-04-29': 9,
      '2026-04-28': 10,
      '2026-04-27': 8
    }
    expect(getStreak(log, GOAL, today)).toBe(4)
  })

  it('does NOT break the streak if today is short (today not done yet)', () => {
    // The user has not finished drinking today yet, but yesterday and the day
    // before were both at goal — the streak should still be 2.
    const log = {
      '2026-04-30': 3, // today, below goal
      '2026-04-29': 8,
      '2026-04-28': 8
    }
    expect(getStreak(log, GOAL, today)).toBe(2)
  })

  it('breaks the streak on the first short day after today', () => {
    const log = {
      '2026-04-30': 8,
      '2026-04-29': 8,
      '2026-04-28': 4, // gap
      '2026-04-27': 8 // should not count
    }
    expect(getStreak(log, GOAL, today)).toBe(2)
  })

  it('treats missing days as 0 cups (breaks the streak)', () => {
    const log = {
      '2026-04-30': 8,
      '2026-04-29': 8
      // 2026-04-28 missing entirely
    }
    expect(getStreak(log, GOAL, today)).toBe(2)
  })

  it('respects a custom goal', () => {
    const log = {
      '2026-04-30': 5,
      '2026-04-29': 5,
      '2026-04-28': 4
    }
    expect(getStreak(log, 5, today)).toBe(2)
  })

  it('returns 0 when log is null/undefined', () => {
    expect(getStreak(null, GOAL, today)).toBe(0)
    expect(getStreak(undefined, GOAL, today)).toBe(0)
  })

  it('handles month boundaries correctly', () => {
    const may1 = new Date('2026-05-01T10:00:00')
    const log = {
      '2026-05-01': 8,
      '2026-04-30': 8,
      '2026-04-29': 8
    }
    expect(getStreak(log, GOAL, may1)).toBe(3)
  })
})

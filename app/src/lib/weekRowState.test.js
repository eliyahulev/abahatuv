import { describe, it, expect } from 'vitest'
import { getWeekRowState } from './weekRowState'

const base = {
  weekNumber: 1,
  currentWeek: 1,
  dayOfWeek: 1,
  hasStarted: true,
  daysUntilStart: 0
}

describe('getWeekRowState — once the user has started', () => {
  it('marks the active week as current and unlocked', () => {
    const s = getWeekRowState({ ...base, weekNumber: 3, currentWeek: 3 })
    expect(s.isLocked).toBe(false)
    expect(s.isCurrent).toBe(true)
    expect(s.showOpensTomorrow).toBe(false)
    expect(s.showStartsBadge).toBe(false)
  })

  it('keeps past weeks unlocked but not current', () => {
    const s = getWeekRowState({ ...base, weekNumber: 1, currentWeek: 3 })
    expect(s.isLocked).toBe(false)
    expect(s.isCurrent).toBe(false)
  })

  it('locks every week that is past the current one', () => {
    const s = getWeekRowState({ ...base, weekNumber: 5, currentWeek: 3 })
    expect(s.isLocked).toBe(true)
    expect(s.isCurrent).toBe(false)
  })

  it('flags the next-up row as "opens tomorrow" on day 7', () => {
    const s = getWeekRowState({
      ...base,
      weekNumber: 4,
      currentWeek: 3,
      dayOfWeek: 7
    })
    expect(s.isLocked).toBe(true)
    expect(s.showOpensTomorrow).toBe(true)
    expect(s.badgeLabel).toBe('נפתח מחר')
  })

  it('does not show "opens tomorrow" earlier in the week', () => {
    for (const dayOfWeek of [1, 2, 3, 4, 5, 6]) {
      const s = getWeekRowState({
        ...base,
        weekNumber: 4,
        currentWeek: 3,
        dayOfWeek
      })
      expect(s.showOpensTomorrow).toBe(false)
    }
  })

  it('does not show "opens tomorrow" on the last week (no week 9)', () => {
    const s = getWeekRowState({
      ...base,
      weekNumber: 9,
      currentWeek: 8,
      dayOfWeek: 7
    })
    expect(s.showOpensTomorrow).toBe(false)
  })

  it('only flags the immediate next-up row, not later ones', () => {
    // currentWeek=3, day 7 → only week 4 should get the hint, not weeks 5+.
    const s5 = getWeekRowState({
      ...base,
      weekNumber: 5,
      currentWeek: 3,
      dayOfWeek: 7
    })
    expect(s5.showOpensTomorrow).toBe(false)
  })
})

describe('getWeekRowState — while pre-start (start date is in the future)', () => {
  const preStart = { ...base, hasStarted: false, currentWeek: 0 }

  it('locks every week, including week 1', () => {
    for (const weekNumber of [1, 2, 8]) {
      const s = getWeekRowState({ ...preStart, weekNumber, daysUntilStart: 5 })
      expect(s.isLocked).toBe(true)
      expect(s.isCurrent).toBe(false)
    }
  })

  it('shows "starts in N days" badge on week 1 when more than 1 day out', () => {
    const s = getWeekRowState({ ...preStart, weekNumber: 1, daysUntilStart: 5 })
    expect(s.showStartsBadge).toBe(true)
    expect(s.showOpensTomorrow).toBe(false)
  })

  it('flips week 1 to "starts tomorrow" when daysUntilStart === 1', () => {
    const s = getWeekRowState({ ...preStart, weekNumber: 1, daysUntilStart: 1 })
    expect(s.showStartsBadge).toBe(false)
    expect(s.showOpensTomorrow).toBe(true)
    expect(s.badgeLabel).toBe('מתחיל מחר')
  })

  it('does not put the "starts" badges on weeks 2+', () => {
    const s = getWeekRowState({ ...preStart, weekNumber: 2, daysUntilStart: 1 })
    expect(s.showOpensTomorrow).toBe(false)
    expect(s.showStartsBadge).toBe(false)
  })
})

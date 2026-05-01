import { describe, it, expect } from 'vitest'
import { getTasksForWeek } from './weekTasks'
import { weeks } from '../data/weeks'

const isExpired = (t, weekNumber) =>
  typeof t.endsAfterWeek === 'number' && weekNumber > t.endsAfterWeek

const expectedCount = (weekNumber) =>
  weeks
    .filter(w => w.number <= weekNumber)
    .reduce(
      (sum, w) =>
        sum +
        w.missionTasks.filter(t => {
          if (t.transient && w.number !== weekNumber) return false
          if (isExpired(t, weekNumber)) return false
          return true
        }).length,
      0
    )

describe('getTasksForWeek', () => {
  it('returns an empty list for week 0 (pre-start)', () => {
    expect(getTasksForWeek(0)).toEqual([])
  })

  it('returns an empty list for negative inputs', () => {
    expect(getTasksForWeek(-1)).toEqual([])
  })

  it('returns only week-1 tasks for week 1', () => {
    const tasks = getTasksForWeek(1)
    const week1 = weeks.find(w => w.number === 1)
    expect(tasks).toHaveLength(week1.missionTasks.length)
    expect(tasks.every(t => t.weekNumber === 1)).toBe(true)
  })

  it('keeps transient tasks on the week they belong to', () => {
    expect(getTasksForWeek(1).some(t => t.id === 'w1-eat-normal')).toBe(true)
    expect(getTasksForWeek(2).some(t => t.id === 'w2-fruit')).toBe(true)
  })

  it('drops the transient w1-eat-normal task from week 2 onward', () => {
    for (const week of [2, 3, 4, 5, 8]) {
      const tasks = getTasksForWeek(week)
      expect(tasks.some(t => t.id === 'w1-eat-normal')).toBe(false)
    }
  })

  it('drops the transient w2-fruit task from week 3 onward', () => {
    for (const week of [3, 4, 5, 8]) {
      const tasks = getTasksForWeek(week)
      expect(tasks.some(t => t.id === 'w2-fruit')).toBe(false)
    }
  })

  it('keeps w5-avoid-nuts through week 7 (its endsAfterWeek)', () => {
    for (const week of [5, 6, 7]) {
      const tasks = getTasksForWeek(week)
      expect(tasks.some(t => t.id === 'w5-avoid-nuts')).toBe(true)
    }
  })

  it('drops w5-avoid-nuts in week 8 (maintenance)', () => {
    const tasks = getTasksForWeek(8)
    expect(tasks.some(t => t.id === 'w5-avoid-nuts')).toBe(false)
  })

  it('accumulates non-transient tasks from every preceding week', () => {
    const tasks = getTasksForWeek(3)
    expect(tasks).toHaveLength(expectedCount(3))

    const seenWeeks = new Set(tasks.map(t => t.weekNumber))
    expect(seenWeeks).toEqual(new Set([1, 2, 3]))
  })

  it('includes every non-transient task by week 8', () => {
    const tasks = getTasksForWeek(8)
    expect(tasks).toHaveLength(expectedCount(8))
  })

  it('tags each task with its source weekNumber', () => {
    const tasks = getTasksForWeek(2)
    for (const t of tasks) {
      expect(typeof t.weekNumber).toBe('number')
      expect(t.weekNumber).toBeGreaterThanOrEqual(1)
      expect(t.weekNumber).toBeLessThanOrEqual(2)
    }
  })

  it('does not mutate the source week.missionTasks arrays', () => {
    const before = weeks[0].missionTasks.length
    getTasksForWeek(8)
    expect(weeks[0].missionTasks).toHaveLength(before)
  })
})

import { describe, it, expect } from 'vitest'
import { getTasksForWeek } from './weekTasks'
import { weeks } from '../data/weeks'

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

  it('accumulates tasks from every preceding week', () => {
    // Week 3 should contain everything from weeks 1, 2, and 3.
    const tasks = getTasksForWeek(3)
    const expected =
      weeks[0].missionTasks.length +
      weeks[1].missionTasks.length +
      weeks[2].missionTasks.length
    expect(tasks).toHaveLength(expected)

    const seenWeeks = new Set(tasks.map(t => t.weekNumber))
    expect(seenWeeks).toEqual(new Set([1, 2, 3]))
  })

  it('includes every task by week 8', () => {
    const tasks = getTasksForWeek(8)
    const total = weeks.reduce((sum, w) => sum + w.missionTasks.length, 0)
    expect(tasks).toHaveLength(total)
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

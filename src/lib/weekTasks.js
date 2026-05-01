import { weeks } from '../data/weeks'

// Accumulate every mission task from week 1 up through the given week
// number. Used by the daily checklist and the dashboard stats. Returns
// [] for weekNumber <= 0 (e.g. while the user's start date is still in
// the future).
export function getTasksForWeek(weekNumber) {
  const tasks = []
  for (const w of weeks) {
    if (w.number > weekNumber) continue
    for (const t of w.missionTasks) {
      if (t.transient && w.number !== weekNumber) continue
      if (typeof t.endsAfterWeek === 'number' && weekNumber > t.endsAfterWeek) continue
      tasks.push({ ...t, weekNumber: w.number })
    }
  }
  return tasks
}

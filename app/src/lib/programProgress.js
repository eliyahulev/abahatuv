import { daysBetween } from '../hooks/useLocalStorage'

const TOTAL_WEEKS = 8

// Single source of truth for "where is the user in the 8-week program?".
// Takes the persisted ISO startDate and (optionally) a Date acting as
// "today", and returns every derived value the UI needs:
//
//   hasStarted      - false while startDate is in the future
//   daysIn          - clamped to >= 0; days since the start date
//   daysUntilStart  - clamped to >= 0; days until the start date
//   currentWeek     - 0 while pre-start, otherwise 1..TOTAL_WEEKS
//   dayOfWeek       - 1..7 within currentWeek (1 while pre-start)
//
// Keeping this in one place means App.jsx, Dashboard.jsx, and the
// header all derive these the same way.

export function getProgramProgress(startDate, today = new Date()) {
  if (!startDate) {
    return {
      hasStarted: false,
      daysIn: 0,
      daysUntilStart: 0,
      currentWeek: 0,
      dayOfWeek: 1
    }
  }

  const rawDays = daysBetween(startDate, today)
  const hasStarted = rawDays >= 0
  const daysIn = Math.max(0, rawDays)
  const daysUntilStart = Math.max(0, -rawDays)
  const currentWeek = hasStarted
    ? Math.min(TOTAL_WEEKS, Math.floor(daysIn / 7) + 1)
    : 0
  const dayOfWeek = hasStarted ? (daysIn % 7) + 1 : 1

  return { hasStarted, daysIn, daysUntilStart, currentWeek, dayOfWeek }
}

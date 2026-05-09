import { daysBetween } from '../hooks/useLocalStorage'

const TOTAL_WEEKS = 8

// The program day rolls over this many hours before local midnight, so
// users who interact with the app late in the evening (e.g. logging the
// last meal of the day) already see the next week's content unlocked.
const ROLLOVER_HOURS_BEFORE_MIDNIGHT = 4

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

  // Shift "today" forward by 4 hours so the program day counter advances
  // at 20:00 local instead of midnight. daysBetween itself stays a pure
  // calendar-day function (used elsewhere for water log keys etc.).
  const shifted = new Date(today.getTime() + ROLLOVER_HOURS_BEFORE_MIDNIGHT * 60 * 60 * 1000)
  const rawDays = daysBetween(startDate, shifted)
  const hasStarted = rawDays >= 0
  const daysIn = Math.max(0, rawDays)
  const daysUntilStart = Math.max(0, -rawDays)
  const currentWeek = hasStarted
    ? Math.min(TOTAL_WEEKS, Math.floor(daysIn / 7) + 1)
    : 0
  const dayOfWeek = hasStarted ? (daysIn % 7) + 1 : 1

  return { hasStarted, daysIn, daysUntilStart, currentWeek, dayOfWeek }
}

// Count the user's consecutive water-goal-met streak ending at `today`.
// Today is allowed to not be done yet — the streak walks backwards from
// `today` until it hits a day below `goal`, but the very first day
// (today itself) is allowed to be short without breaking the streak.
//
// `log` is a `{ "YYYY-MM-DD": cupsCount }` map. `today` defaults to
// `new Date()` so the production call site stays a no-arg call; tests
// pass a fixed Date.

const MAX_LOOKBACK_DAYS = 60

function dateKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getStreak(log, goal, today = new Date()) {
  if (!log || goal == null) return 0
  let streak = 0
  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const cups = log[dateKey(d)] || 0
    if (cups >= goal) {
      streak++
    } else if (i !== 0) {
      break
    }
  }
  return streak
}

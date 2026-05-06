// Pure derivation of how a single row in WeekView should render. Pulled
// out of the component so the locking + badge rules can be unit-tested
// without touching React.
//
// Inputs:
//   weekNumber      - 1..8, the week this row represents
//   currentWeek     - the user's active week (0 if their start date is in
//                     the future, otherwise 1..8)
//   dayOfWeek       - 1..7 within currentWeek; only meaningful when
//                     hasStarted is true
//   hasStarted      - false while the user's start date is in the future
//   daysUntilStart  - days until the start date arrives (0 once started)
//
// Returns: { isLocked, isCurrent, isNextUp, showOpensTomorrow,
//            showStartsBadge, badgeLabel }
//   isLocked          - row should not be expandable
//   isCurrent         - "this is your week" highlight
//   isNextUp          - the row that immediately follows currentWeek
//   showOpensTomorrow - badge "opens tomorrow" / "starts tomorrow"
//   showStartsBadge   - badge with the full "starts in N days" label,
//                       only shown for week 1 while pre-start and
//                       daysUntilStart > 1
//   badgeLabel        - the "soon" badge text (or null if no soon badge)

export function getWeekRowState({
  weekNumber,
  currentWeek,
  dayOfWeek = 1,
  hasStarted = true,
  daysUntilStart = 0
}) {
  const isLocked = !hasStarted || weekNumber > currentWeek
  const isCurrent = hasStarted && currentWeek === weekNumber
  const isNextUp = hasStarted && weekNumber === currentWeek + 1
  const isFirstUpPreStart = !hasStarted && weekNumber === 1

  // Day 7 of the current week → tomorrow a new week opens. Cap at 8 so
  // the "next" badge does not appear after the program ends.
  const opensTomorrow = hasStarted && dayOfWeek === 7 && currentWeek < 8

  const showOpensTomorrow =
    (isNextUp && opensTomorrow) ||
    (isFirstUpPreStart && daysUntilStart === 1)

  const showStartsBadge = isFirstUpPreStart && daysUntilStart > 1

  let badgeLabel = null
  if (showOpensTomorrow) {
    badgeLabel = isFirstUpPreStart ? 'מתחיל מחר' : 'נפתח מחר'
  }

  return {
    isLocked,
    isCurrent,
    isNextUp,
    isFirstUpPreStart,
    showOpensTomorrow,
    showStartsBadge,
    badgeLabel
  }
}

// Date helpers shared across the app. (The legacy useLocalStorage hook was
// removed when all state moved to Firestore via useUserData.)

export const todayKey = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const daysBetween = (fromIso, toDate = new Date()) => {
  if (!fromIso) return 0
  // Anchor both ends at UTC midnight by year/month/day so DST transitions
  // (e.g. losing an hour the night clocks spring forward) cannot turn a
  // 49-day span into 48.
  const [y, m, d] = fromIso.split('-').map(Number)
  const fromUtc = Date.UTC(y, m - 1, d)
  const to = new Date(toDate)
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.floor((toUtc - fromUtc) / (1000 * 60 * 60 * 24))
}

// Hebrew label for "starts in N days" used while the user's startDate is in
// the future. 0 means today, 1 → "מחר", 2 → "יומיים", else → "X ימים".
export const startsInLabel = (days) => {
  if (days <= 0) return 'מתחיל היום'
  if (days === 1) return 'מתחיל מחר'
  if (days === 2) return 'מתחיל בעוד יומיים'
  return `מתחיל בעוד ${days} ימים`
}

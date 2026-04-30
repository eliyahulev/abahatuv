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
  const from = new Date(fromIso + 'T00:00:00')
  const to = new Date(toDate)
  to.setHours(0, 0, 0, 0)
  from.setHours(0, 0, 0, 0)
  return Math.floor((to - from) / (1000 * 60 * 60 * 24))
}

// Hebrew label for "starts in N days" used while the user's startDate is in
// the future. 0 means today, 1 → "מחר", 2 → "יומיים", else → "X ימים".
export const startsInLabel = (days) => {
  if (days <= 0) return 'מתחיל היום'
  if (days === 1) return 'מתחיל מחר'
  if (days === 2) return 'מתחיל בעוד יומיים'
  return `מתחיל בעוד ${days} ימים`
}

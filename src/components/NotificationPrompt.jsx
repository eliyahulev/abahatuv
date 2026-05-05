import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { enablePushNotifications } from '../lib/messaging'

export default function NotificationPrompt({ onClose }) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const enable = async () => {
    if (!user?.uid || busy) return
    setBusy(true)
    setErr(null)
    try {
      await enablePushNotifications(user.uid)
    } catch (e) {
      setErr(e?.message || 'שגיאה בהפעלת ההתראות.')
      setBusy(false)
      return
    }
    onClose()
  }

  return (
    <div className="new-week-backdrop" role="dialog" aria-modal="true">
      <div className="new-week-card">
        <div className="new-week-burst" aria-hidden>
          <span>הפעלת התראות</span>
        </div>

        <div style={{ padding: '4px 2px 14px' }}>
          <h2 className="new-week-title" style={{ marginTop: 0 }}>נשלח לך עדכונים חשובים</h2>
          <p className="muted" style={{ margin: 0 }}>
            הפעילו התראות כדי לקבל תזכורות, עדכונים ומסרים ישירות למכשיר.
          </p>
          {err && (
            <p className="muted small" style={{ marginTop: 8, color: 'var(--accent-red)' }}>{err}</p>
          )}
        </div>

        <div className="new-week-actions">
          <button className="btn-secondary" onClick={onClose} disabled={busy}>
            לא עכשיו
          </button>
          <button className="btn-primary" onClick={enable} disabled={busy}>
            {busy ? 'מפעיל…' : 'הפעל התראות'}
          </button>
        </div>
      </div>
    </div>
  )
}

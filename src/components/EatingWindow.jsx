import React, { useState, useEffect } from 'react'
import { useUserField } from '../hooks/useUserData'
import { ViewTitle, ClockIcon, StatusDotIcon, LightbulbIcon } from '../icons'

function formatDuration(ms) {
  if (ms < 0) ms = 0
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function EatingWindow() {
  const [hours, setHours] = useUserField('ewHours', 10)
  const [startTime, setStartTime] = useUserField('ewStart', null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const endTime = startTime ? startTime + hours * 3600 * 1000 : null
  const isEating = startTime && now < endTime
  const isFasting = endTime && now >= endTime

  const start = () => setStartTime(Date.now())
  const reset = () => setStartTime(null)

  return (
    <div className="view">
      <ViewTitle Icon={ClockIcon}>חלון אכילה</ViewTitle>
      <p className="view-subtitle">
        שבוע 6: בחרו חלון אכילה בן 8–12 שעות ביום.
      </p>

      <div className="window-timer">
        {!startTime && (
          <>
            <div className="window-state">טרם הותחל</div>
            <div className="window-countdown">{hours}:00:00</div>
            <div className="window-until">לחצו על "התחל" בזמן הביס הראשון של היום</div>
          </>
        )}
        {isEating && (
          <>
            <div className="window-state window-state-with-dot">
              <StatusDotIcon color="#22c55e" />
              <span>בחלון אכילה</span>
            </div>
            <div className="window-countdown">{formatDuration(endTime - now)}</div>
            <div className="window-until">
              נגמר ב-{new Date(endTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </>
        )}
        {isFasting && (
          <>
            <div className="window-state window-state-with-dot">
              <StatusDotIcon color="#7c3aed" />
              <span>בצום</span>
            </div>
            <div className="window-countdown">{formatDuration(now - endTime)}</div>
            <div className="window-until">חלון האכילה הסתיים — שתו מים, קפה או תה</div>
          </>
        )}
      </div>

      <div className="card">
        <h3 className="card-title">משך חלון האכילה</h3>
        <div className="window-presets">
          {[8, 10, 12].map(h => (
            <button
              key={h}
              className={`preset-btn ${hours === h ? 'active' : ''}`}
              onClick={() => setHours(h)}
              disabled={!!startTime}
            >
              {h} שעות
            </button>
          ))}
        </div>

        {!startTime && <button className="btn-primary" onClick={start}>התחל חלון אכילה</button>}
        {startTime && <button className="btn-secondary" onClick={reset}>איפוס</button>}
      </div>

      <div className="card">
        <h3 className="card-title card-title-with-icon"><LightbulbIcon size={22} />טיפים</h3>
        <ul className="section-list">
          <li>נתון לשתות קפה או תה ללא הגבלה במהלך הצום (ללא סוכר וללא חלב).</li>
          <li>הימנעו מנשנושים בלתי פוסקים בזמן חלון האכילה. אכלו ארוחות מסודרות.</li>
          <li>החליטו מראש בתחילת היום על חלון האכילה — כדי למנוע "עיגולי פינות" בחסות הדופמין.</li>
          <li>הורדה משמעותית של רמת האינסולין הבסיסית + איזון רמות הסוכר במצב צום = אנרגיה יציבה יותר.</li>
        </ul>
      </div>
    </div>
  )
}

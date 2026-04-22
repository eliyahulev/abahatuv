import React from 'react'
import { useLocalStorage, todayKey } from '../hooks/useLocalStorage'

const GOAL = 8         // baseline — 2 liters
const STRETCH = 16     // 4 liters

function last7Days() {
  const days = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    days.push({ key, label: ['א','ב','ג','ד','ה','ו','ש'][d.getDay()] })
  }
  return days
}

export function WaterWidget() {
  const date = todayKey()
  const [log, setLog] = useLocalStorage('waterLog', {})
  const cups = log[date] || 0
  const pct = Math.min(100, (cups / GOAL) * 100)

  const update = (delta) => {
    setLog(prev => ({ ...prev, [date]: Math.max(0, (prev[date] || 0) + delta) }))
  }

  return (
    <div className="card">
      <div className="space-between">
        <h3 className="card-title" style={{ margin: 0 }}>💧 מים היום</h3>
        <span className="badge">{cups} כוסות</span>
      </div>
      <div className="water-progress" style={{ marginTop: 14 }}>
        <div className="water-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="water-goal-line">יעד: {GOAL} כוסות (2 ליטר) | יעד מורחב: {STRETCH} כוסות</div>
      <div className="water-controls" style={{ marginTop: 14, marginBottom: 0 }}>
        <button className="btn-cup minus" onClick={() => update(-1)}>− 1</button>
        <button className="btn-cup" onClick={() => update(1)}>+ 1 כוס</button>
      </div>
    </div>
  )
}

export default function WaterTracker() {
  const date = todayKey()
  const [log, setLog] = useLocalStorage('waterLog', {})
  const cups = log[date] || 0
  const pct = Math.min(100, (cups / GOAL) * 100)
  const days = last7Days()
  const maxInWeek = Math.max(STRETCH, ...days.map(d => log[d.key] || 0))

  const update = (delta) => {
    setLog(prev => ({ ...prev, [date]: Math.max(0, (prev[date] || 0) + delta) }))
  }

  const setTo = (n) => setLog(prev => ({ ...prev, [date]: n }))

  return (
    <div className="view">
      <h1 className="view-title">💧 מעקב מים</h1>
      <p className="view-subtitle">
        שבוע 1: 2–4 ליטר מים ליום + 2 כוסות לפני כל ארוחה
      </p>

      <div className="water-display">
        <div className="water-cups-big">{cups}</div>
        <div className="water-cups-label">כוסות היום ({(cups * 0.25).toFixed(2)} ליטר)</div>
        <div className="water-progress">
          <div className="water-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="water-goal-line">
          יעד: {GOAL} כוסות · יעד מורחב: {STRETCH}
        </div>
      </div>

      <div className="water-controls">
        <button className="btn-cup minus" onClick={() => update(-1)}>− כוס</button>
        <button className="btn-cup" onClick={() => update(1)}>+ כוס</button>
      </div>

      <div className="water-controls" style={{ marginBottom: 20 }}>
        <button className="btn-secondary" onClick={() => setTo(0)}>איפוס</button>
        <button className="btn-secondary" onClick={() => update(2)}>+ 2 (לפני ארוחה)</button>
      </div>

      <div className="water-chart">
        <h3>7 ימים אחרונים</h3>
        <div className="water-bars">
          {days.map((d, i) => {
            const count = log[d.key] || 0
            const h = maxInWeek ? (count / maxInWeek) * 100 : 0
            const isToday = d.key === date
            return (
              <div key={d.key} className="water-bar-col">
                <div
                  className={`water-bar ${isToday ? 'today' : ''}`}
                  style={{ height: `${h}%` }}
                  title={`${count} כוסות`}
                />
                <div className="water-bar-label">{d.label}</div>
                <div className="water-bar-label" style={{ fontWeight: 600 }}>{count}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
